from flask import Flask, request, jsonify, abort, redirect, render_template
from backend.functions.mongo.seriesdb import seriesStreams, seriesCatalog
from backend.functions.mongo.moviedb import movieStreams, movieCatalog
from backend.functions.mongo.content_service import ContentService
from backend.functions.manage import addMovie, addSeries, removeMovie, removeSeries
from backend.functions.metadata.metadata import Metadata
from pymongo import MongoClient
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('mongodb.env', override=True)
MONGO_USERNAME = os.getenv('MONGO_USERNAME')
MONGO_PASSWORD = os.getenv('MONGO_PASSWORD')
MONGO_CLUSTER_URL = os.getenv('MONGO_CLUSTER_URL')
MONGO_CLUSTER_NAME = os.getenv('MONGO_CLUSTER_NAME')

# Construct MongoDB URL
MONGO_URL = f"mongodb+srv://{MONGO_USERNAME}:{MONGO_PASSWORD}@{MONGO_CLUSTER_URL}.mongodb.net"
print(f"Loaded MONGO_USERNAME from env: {MONGO_USERNAME}")
print(f"Loaded MONGO_CLUSTER_URL from env: {MONGO_CLUSTER_URL}")
print(f"Constructed MONGO_URL: {MONGO_URL}")

# Parse MongoDB URL to extract credentials for templates
def parse_mongo_url():
    if MONGO_USERNAME and MONGO_PASSWORD and MONGO_CLUSTER_URL:
        return {
            'user': MONGO_USERNAME,
            'passw': MONGO_PASSWORD,
            'cluster': MONGO_CLUSTER_URL
        }
    return {'user': '', 'passw': '', 'cluster': ''}

BEST_TRACKERS = "https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_best.txt"

MANIFEST = {
    "id": "org.stremio.streamsave",
    "version": "0.0.3",
    "name": "Stream Save",
    "description": "save custom stream links and play in different devices",

    'resources': [
        'catalog',
        {'name': 'stream', 'types': ['movie', 'series'], 'idPrefixes': ['tt']}
    ],

    "types": ["movie", "series", "other"],

    'catalogs': [
        {'type': 'movie', 'name': 'Saved Movies', 'id': 'stream_save_movies'},
        {'type': 'series', 'name': 'Saved Series', 'id': 'stream_save_series'},
    ],

    'behaviorHints': {
        'configurable': True,
    },

    "idPrefixes": ["tt"]
}

app = Flask(__name__, template_folder="./ui")


def respond_with(data):
    resp = jsonify(data)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Headers'] = '*'
    return resp


@app.route('/<user>/<passw>/<cluster>/manifest.json')
def manifest_json(user, passw, cluster):
    return respond_with(MANIFEST)


@app.route('/manifest.json')
def config_redirect():
    return respond_with(MANIFEST)


@app.route('/<user>/<passw>/<cluster>/stream/<type>/<id>.json')
def stream(user, passw, cluster, type, id):
    try:
        db_url = f"mongodb+srv://{user}:{passw}@{cluster}.mongodb.net"
        client = MongoClient(db_url, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
        
        if type not in MANIFEST["types"]:
            abort(404)
            
        streams = {'streams': []}
        if type == 'movie':
            s = movieStreams(client)
        elif type == 'series':
            s = seriesStreams(client)
        else:
            abort(404)
            return

        a = s.find(id)

        if a is not None:
            stream = a['data']
            print(stream)
            if "infoHash" in list(stream.keys()):
                trackers = requests.get(BEST_TRACKERS).text.split()
                trackers = list(map(Metadata.append_tracker, trackers))
                if 'sources' not in stream.keys():
                    stream['sources'] = []

                sources = stream['sources']
                stream['sources'] = trackers + sources

            streams['streams'].append(stream)

        return respond_with(streams)
    except Exception as e:
        print(f"Error in stream endpoint: {e}")
        abort(500, description="Internal server error")


@app.route('/<user>/<passw>/<cluster>/catalog/<entity_type>/<id>.json')
def addon_catalog(user, passw, cluster, entity_type, id):
    try:
        db_url = f"mongodb+srv://{user}:{passw}@{cluster}.mongodb.net"
        client = MongoClient(db_url, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
        
        if entity_type not in MANIFEST["types"]:
            abort(404)

        if entity_type == 'movie':
            catalog = movieCatalog(client)
        elif entity_type == 'series':
            catalog = seriesCatalog(client)
        else:
            abort(404)
            return

        metaPreviews = {}
        print("catalog is about to be printed")
        # Print the type and repr of catalog for debugging, since catalog is not JSON serializable
        print("catalog type:", type(catalog), "repr:", repr(catalog))

        c = catalog.full()

        if c is not None:
            metaPreviews['metas'] = c
        else:
            abort(404)

        return respond_with(metaPreviews)
    except Exception as e:
        print(f"Error in addon_catalog endpoint: {e}")
        abort(500, description="Internal server error")

@app.route('/addon_catalog/<type>', methods=['GET'])
def addon_catalog_redirect(type):
    if type not in ['movie', 'series']:
        abort(404)

    # Get user, passw, cluster from env or use default values ""
    mongo_creds = parse_mongo_url()
    user = mongo_creds.get('user', '')
    passw = mongo_creds.get('passw', '')
    cluster = mongo_creds.get('cluster', '')
    return redirect(f"/{user}/{passw}/{cluster}/catalog/{type}/id.json")


# MongoDB client with connection pooling
def get_mongo_client():
    """Get MongoDB client with connection pooling"""
    try:
        client = MongoClient(
            MONGO_URL,
            maxPoolSize=10,
            minPoolSize=1,
            maxIdleTimeMS=30000,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        # Test connection
        client.admin.command('ping')
        return client
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        return None

# API Routes for React Frontend
@app.route('/api/content', methods=['GET'])
def api_get_all_content():
    """API endpoint to get all content from the database"""
    try:
        # Get MongoDB credentials from environment
        mongo_creds = parse_mongo_url()
        if not mongo_creds['user'] or not mongo_creds['passw'] or not mongo_creds['cluster']:
            return respond_with({'error': 'MongoDB credentials not configured'}), 400
        
        # Use the cached client function
        client = get_mongo_client()
        if not client:
            return respond_with({'error': 'Database connection failed'}), 500
        
        # Get all movies and series
        movie_catalog = movieCatalog(client)
        series_catalog = seriesCatalog(client)
        
        all_movies = movie_catalog.full() if movie_catalog.full() else []
        all_series = series_catalog.full() if series_catalog.full() else []
        
        # Combine and format the data
        content = []
        
        if all_movies:
            for movie in all_movies:
                content.append({
                    'id': movie.get('id'),
                    'type': 'movie',
                    'title': movie.get('name'),
                    'description': movie.get('overview'),
                    'poster': movie.get('poster'),
                    'year': movie.get('year'),
                    'rating': movie.get('rating')
                })
        
        if all_series:
            for series in all_series:
                content.append({
                    'id': series.get('id'),
                    'type': 'series',
                    'title': series.get('name'),
                    'description': series.get('overview'),
                    'poster': series.get('poster'),
                    'year': series.get('year'),
                    'rating': series.get('rating')
                })
        
        print(f"Retrieved {len(content)} total content items")
        return respond_with({'content': content, 'total_count': len(content)})
        
    except Exception as e:
        print(f"Error fetching all content: {str(e)}")
        return respond_with({'error': f'Failed to fetch content: {str(e)}'}), 500

@app.route('/api/movies', methods=['GET'])
def api_get_movies():
    """API endpoint to get all movies"""
    try:
        mongo_creds = parse_mongo_url()
        if not mongo_creds['user'] or not mongo_creds['passw'] or not mongo_creds['cluster']:
            return respond_with({'error': 'MongoDB credentials not configured'}), 400
        
        # Use the cached client function
        client = get_mongo_client()
        if not client:
            return respond_with({'error': 'Database connection failed'}), 500
        
        movie_catalog = movieCatalog(client)
        all_movies = movie_catalog.full() if movie_catalog.full() else []
        
        movies = []
        if all_movies:
            for movie in all_movies:
                movies.append({
                    'id': movie.get('id'),
                    'type': 'movie',
                    'title': movie.get('name'),
                    'description': movie.get('overview'),
                    'poster': movie.get('poster'),
                    'year': movie.get('year'),
                    'rating': movie.get('rating')
                })
        
        print(f"Retrieved {len(movies)} movies")
        return respond_with({'movies': movies, 'count': len(movies)})
        
    except Exception as e:
        print(f"Error fetching movies: {str(e)}")
        return respond_with({'error': f'Failed to fetch movies: {str(e)}'}), 500

@app.route('/api/series', methods=['GET'])
def api_get_series():
    """API endpoint to get all series"""
    try:
        mongo_creds = parse_mongo_url()
        if not mongo_creds['user'] or not mongo_creds['passw'] or not mongo_creds['cluster']:
            return respond_with({'error': 'MongoDB credentials not configured'}), 400
        
        # Use the cached client function
        client = get_mongo_client()
        if not client:
            return respond_with({'error': 'Database connection failed'}), 500
        
        series_catalog = seriesCatalog(client)
        all_series = series_catalog.full() if series_catalog.full() else []
        
        series = []
        if all_series:
            for s in all_series:
                series.append({
                    'id': s.get('id'),
                    'type': 'series',
                    'title': s.get('name'),
                    'description': s.get('overview'),
                    'poster': s.get('poster'),
                    'year': s.get('year'),
                    'rating': s.get('rating')
                })
        
        print(f"Retrieved {len(series)} series")
        return respond_with({'series': series, 'count': len(series)})
        
    except Exception as e:
        print(f"Error fetching series: {str(e)}")
        return respond_with({'error': f'Failed to fetch series: {str(e)}'}), 500

@app.route('/catalog', methods=['GET'])
def get_all_content():
    """Get all content from the database (via ContentService with detailed logs)."""
    try:
        mongo_creds = parse_mongo_url()
        if not mongo_creds['user'] or not mongo_creds['passw'] or not mongo_creds['cluster']:
            print("[Catalog] MongoDB credentials not configured")
            return respond_with({'error': 'MongoDB credentials not configured'}), 400

        print("[Catalog] Building MongoDB client...")
        client = get_mongo_client()
        if not client:
            print("[Catalog] Database connection failed")
            return respond_with({'error': 'Database connection failed'}), 500

        service = ContentService(client)
        content = service.fetch_all_content()
        print(f"[Catalog] Returning {len(content)} items")
        return respond_with({'content': content, 'total_count': len(content)})

    except Exception as e:
        print(f"[Catalog] Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return respond_with({'error': f'Failed to fetch content: {str(e)}'}), 500


@app.route('/configure', methods=['GET', 'POST'])
def configure():
    if request.method == 'POST':
        # Use environment variable if set, otherwise use form field
        url = MONGO_URL if MONGO_URL else request.form['db_url']
        url = url.replace("mongodb+srv://", "")
        url = url.split('@')
        user = url[0].split(':')[0]
        passw = url[0].split(':')[1]
        cluster = url[1].replace(".mongodb.net", "")
        cluster = cluster.split('/')[0]

        hostUrl = request.host_url.replace("https://", "") if "https" in request.host_url else request.host_url.replace(
            "http://", "")
        print(hostUrl)
        return redirect(f"stremio://{hostUrl}{user}/{passw}/{cluster}/manifest.json")
    else:
        # Get URL parameters for auto-filling, fallback to environment variable
        user = request.args.get('user', '')
        passw = request.args.get('passw', '')
        cluster = request.args.get('cluster', '')
        
        # If no URL parameters, use environment variable
        if not user and not passw and not cluster:
            mongo_creds = parse_mongo_url()
            user = mongo_creds['user']
            passw = mongo_creds['passw']
            cluster = mongo_creds['cluster']
            
        return render_template("configure.html", user=user, passw=passw, cluster=cluster)


@app.route('/manage', methods=['GET', 'POST'])
def manage():
    if request.method == 'POST':
        # Debug: Print all received form data
        print("Received form data:", dict(request.form))
        
        # Use environment variable if set, otherwise use form field
        db_url = MONGO_URL if MONGO_URL else request.form.get('db_url', '')
        
        # If no db_url provided and no environment variable, construct from environment credentials
        if not db_url:
            mongo_creds = parse_mongo_url()
            if mongo_creds['user'] and mongo_creds['passw'] and mongo_creds['cluster']:
                db_url = f"mongodb+srv://{mongo_creds['user']}:{mongo_creds['passw']}@{mongo_creds['cluster']}.mongodb.net"
        
        options = request.form['option']
        content_type = request.form['type']
        imdbID = request.form['imdbID']
        
        # Debug: Print the parsed values
        print(f"Parsed options: '{options}' (type: {type(options)}, length: {len(options)})")
        print(f"Parsed type: '{content_type}' (type: {type(content_type)}, length: {len(content_type)})")
        print(f"Parsed imdbID: '{imdbID}' (type: {type(imdbID)}, length: {len(imdbID)})")
        
        if options == 'add':
            stream = request.form['stream']
            print(f"Stream: '{stream}'")
        else:
            stream = None
            print("No stream (not adding)")

        # Debug: Print the received URL
        print(f"Using db_url: {db_url}")
        print(f"Options: {options}, Type: {content_type}, IMDB ID: {imdbID}")
        print(f"Environment MONGO_URL: {MONGO_URL}")

        try:
            print(f"About to process: options='{options}', type='{content_type}'")
            if options == 'add':
                print("Processing ADD operation")
                if content_type == "movie":
                    print(f"Adding movie: {imdbID}")
                    addMovie(imdbID, stream, db_url)
                elif content_type == 'series':
                    print(f"Adding series: {imdbID}")
                    addSeries(imdbID, stream, db_url)
            elif options == 'remove':
                print("Processing REMOVE operation")
                if content_type == "movie":
                    print(f"Removing movie: {imdbID}")
                    removeMovie(imdbID, db_url)
                elif content_type == 'series':
                    print(f"Removing series: {imdbID}")
                    removeSeries(imdbID, db_url)
            else:
                print(f"Unknown option: '{options}'")
            return "Success"
        except Exception as e:
            print(f"Error details: {str(e)}")
            return f"Failure, {str(e)}"
    else:
        # Get URL parameters for auto-filling, fallback to environment variable
        user = request.args.get('user', '')
        passw = request.args.get('passw', '')
        cluster = request.args.get('cluster', '')
        
        # If no URL parameters, use environment variable
        if not user and not passw and not cluster:
            mongo_creds = parse_mongo_url()
            user = mongo_creds['user']
            passw = mongo_creds['passw']
            cluster = mongo_creds['cluster']
            
        return render_template("manage.html", user=user, passw=passw, cluster=cluster)
    
@app.route('/<user>/<passw>/<cluster>/configure', methods=['GET', 'POST'])
def addon_config_redirect(user, passw, cluster):
    return redirect(f'/manage?user={user}&passw={passw}&cluster={cluster}')


@app.route('/view')
def view_content():
    # Get URL parameters for auto-filling, fallback to environment variable
    user = request.args.get('user', '')
    passw = request.args.get('passw', '')
    cluster = request.args.get('cluster', '')
    
    # If no URL parameters, use environment variable
    if not user and not passw and not cluster:
        mongo_creds = parse_mongo_url()
        user = mongo_creds['user']
        passw = mongo_creds['passw']
        cluster = mongo_creds['cluster']
        
    return render_template("view.html", user=user, passw=passw, cluster=cluster)

@app.route('/')
def default():
    return render_template("index.html")

@app.route('/debug/collections', methods=['GET'])
def debug_collections():
    try:
        client = get_mongo_client()
        if not client:
            return "Failed to get MongoDB client"
        
        # Check movie catalog
        moviecat = movieCatalog(client)
        movie_count = moviecat.col.count_documents({})
        movie_docs = list(moviecat.col.find({}, {'_id': 1, 'name': 1}))
        
        # Check series catalog
        seriescat = seriesCatalog(client)
        series_count = seriescat.col.count_documents({})
        series_docs = list(seriescat.col.find({}, {'_id': 1, 'name': 1}))
        
        debug_info = {
            'movie_catalog': {
                'count': movie_count,
                'documents': movie_docs
            },
            'series_catalog': {
                'count': series_count,
                'documents': series_docs
            }
        }
        
        return jsonify(debug_info)
    except Exception as e:
        return f"Error: {str(e)}"


if __name__ == '__main__':
    app.run(debug=True, port=5001)
