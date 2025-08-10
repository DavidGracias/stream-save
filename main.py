from flask import Flask, request, jsonify, abort, redirect, render_template
from functions.mongo.seriesdb import seriesStreams, seriesCatalog
from functions.mongo.moviedb import movieStreams, movieCatalog
from functions.manage import addMovie, addSeries, removeMovie, removeSeries
from functions.metadata.metadata import Metadata
from pymongo import MongoClient
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('mongodb.env', override=True)
MONGO_URL = os.getenv('MONGO_URL')
print(f"Loaded MONGO_URL from env: {MONGO_URL}")

# Parse MongoDB URL to extract credentials for templates
def parse_mongo_url():
    if MONGO_URL:
        try:
            url = MONGO_URL.replace("mongodb+srv://", "")
            parts = url.split('@')
            credentials = parts[0].split(':')
            cluster = parts[1].replace(".mongodb.net", "").split('/')[0]
            
            return {
                'user': credentials[0],
                'passw': credentials[1],
                'cluster': cluster
            }
        except:
            return {'user': '', 'passw': '', 'cluster': ''}
    return {'user': '', 'passw': '', 'cluster': ''}

BEST_TRACKERS = "https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_best.txt"



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
    db_url = f"mongodb+srv://{user}:{passw}@{cluster}.mongodb.net"
    client = MongoClient(db_url)
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


@app.route('/<user>/<passw>/<cluster>/catalog/<entity_type>/<id>.json')
def addon_catalog(user, passw, cluster, entity_type, id):
    db_url = f"mongodb+srv://{user}:{passw}@{cluster}.mongodb.net"
    client = MongoClient(db_url)
    if entity_type not in MANIFEST["types"]:
        abort(404)

    if entity_type == 'movie':
        catalog = movieCatalog(client)
    elif entity_type == 'series':
        catalog = seriesCatalog(client)
    else:
        abort(404)
        return

    metaPreviews = {

    }
    print("catalog is about to be printed")
    # Print the type and repr of catalog for debugging, since catalog is not JSON serializable
    print("catalog type:", type(catalog), "repr:", repr(catalog))

    c = catalog.full()

    if c is not None:
        metaPreviews['metas'] = c
    else:
        abort(404)

    return respond_with(metaPreviews)

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


# API Routes for React Frontend
@app.route('/api/content', methods=['GET'])
def api_get_all_content():
    """API endpoint to get all content from the database"""
    try:
        # Get MongoDB credentials from environment
        mongo_creds = parse_mongo_url()
        if not mongo_creds['user'] or not mongo_creds['passw'] or not mongo_creds['cluster']:
            return respond_with({'error': 'MongoDB credentials not configured'}), 400
        
        db_url = f"mongodb+srv://{mongo_creds['user']}:{mongo_creds['passw']}@{mongo_creds['cluster']}.mongodb.net"
        client = MongoClient(db_url)
        
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
        
        return respond_with({'content': content})
        
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
        
        db_url = f"mongodb+srv://{mongo_creds['user']}:{mongo_creds['passw']}@{mongo_creds['cluster']}.mongodb.net"
        client = MongoClient(db_url)
        
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
        
        return respond_with({'movies': movies})
        
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
        
        db_url = f"mongodb+srv://{mongo_creds['user']}:{mongo_creds['passw']}@{mongo_creds['cluster']}.mongodb.net"
        client = MongoClient(db_url)
        
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
        
        return respond_with({'series': series})
        
    except Exception as e:
        print(f"Error fetching series: {str(e)}")
        return respond_with({'error': f'Failed to fetch series: {str(e)}'}), 500

@app.route('/catalog', methods=['GET'])
def get_all_content():
    """Get all content from the database"""
    try:
        # Get MongoDB credentials from environment
        mongo_creds = parse_mongo_url()
        if not mongo_creds['user'] or not mongo_creds['passw'] or not mongo_creds['cluster']:
            return respond_with({'error': 'MongoDB credentials not configured'}), 400
        
        db_url = f"mongodb+srv://{mongo_creds['user']}:{mongo_creds['passw']}@{mongo_creds['cluster']}.mongodb.net"
        client = MongoClient(db_url)
        
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
        
        return respond_with({'content': content})
        
    except Exception as e:
        print(f"Error fetching all content: {str(e)}")
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
        # Use environment variable if set, otherwise use form field
        db_url = MONGO_URL if MONGO_URL else request.form['db_url']
        options = request.form['option']
        type = request.form['type']
        imdbID = request.form['imdbID']
        if options == 'add':
            stream = request.form['stream']
        else:
            stream = None

        # Debug: Print the received URL
        print(f"Using db_url: {db_url}")
        print(f"Options: {options}, Type: {type}, IMDB ID: {imdbID}")
        print(f"Environment MONGO_URL: {MONGO_URL}")

        try:
            if options == 'add':
                if type == "movie":
                    addMovie(imdbID, stream, db_url)
                elif type == 'series':
                    addSeries(imdbID, stream, db_url)
            elif options == 'remove':
                if type == "movie":
                    removeMovie(imdbID, db_url)
                elif type == 'series':
                    removeSeries(imdbID, db_url)
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


if __name__ == '__main__':
    app.run(debug=True)
