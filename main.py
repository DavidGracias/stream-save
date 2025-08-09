from flask import Flask, request, jsonify, abort, redirect, render_template
from functions.mongo.seriesdb import seriesStreams, seriesCatalog
from functions.mongo.moviedb import movieStreams, movieCatalog
from functions.manage import addMovie, addSeries, removeMovie, removeSeries
from functions.metadata.metadata import Metadata
from pymongo import MongoClient
import requests

BEST_TRACKERS = "https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_best.txt"

MANIFEST = {
    "id": "org.stremio.streamsave",
    "version": "0.0.3",
    "name": "Stream Save",
    "description": "save custom stream links and play in different devices",

    'resources': [
        'catalog',
        {'name': 'stream', 'types': [
            'movie', 'series'], 'idPrefixes': ['tt']}
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


@app.route('/<user>/<passw>/<cluster>/catalog/<type>/<id>.json')
def addon_catalog(user, passw, cluster, type, id):
    db_url = f"mongodb+srv://{user}:{passw}@{cluster}.mongodb.net"
    client = MongoClient(db_url)
    if type not in MANIFEST["types"]:
        abort(404)

    if type == 'movie':
        catalog = movieCatalog(client)
    elif type == 'series':
        catalog = seriesCatalog(client)
    else:
        abort(404)
        return

    metaPreviews = {

    }

    c = catalog.full()

    if c is not None:
        metaPreviews['metas'] = c
    else:
        abort(404)

    return respond_with(metaPreviews)


@app.route('/configure', methods=['GET', 'POST'])
def configure():
    if request.method == 'POST':
        url = request.form['db_url']
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
        # Get URL parameters for auto-filling
        user = request.args.get('user', '')
        passw = request.args.get('passw', '')
        cluster = request.args.get('cluster', '')
        return render_template("configure.html", user=user, passw=passw, cluster=cluster)


@app.route('/manage', methods=['GET', 'POST'])
def manage():
    if request.method == 'POST':
        db_url = request.form['db_url']
        options = request.form['option']
        type = request.form['type']
        imdbID = request.form['imdbID']
        if options == 'add':
            stream = request.form['stream']
        else:
            stream = None

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
            return f"Failure, {str(e)}"
    else:
        # Get URL parameters for auto-filling
        user = request.args.get('user', '')
        passw = request.args.get('passw', '')
        cluster = request.args.get('cluster', '')
        return render_template("manage.html", user=user, passw=passw, cluster=cluster)
    
@app.route('/<user>/<passw>/<cluster>/configure', methods=['GET', 'POST'])
def addon_config_redirect(user, passw, cluster):
    return redirect(f'/manage?user={user}&passw={passw}&cluster={cluster}')


@app.route('/view', methods=['GET'])
def view_content():
    return render_template("view.html")


@app.route('/settings', methods=['GET'])
def settings():
    return render_template("settings.html")


@app.route('/help', methods=['GET'])
def help_page():
    return render_template("help.html")


@app.route('/')
def default():
    return render_template("index.html")

@app.route('/example')
def example():
    """Example route showing how to use URL parameters"""
    return """
    <h1>URL Parameter Examples</h1>
    <p>You can now pass MongoDB credentials via URL parameters:</p>
    <ul>
        <li><a href="/configure?user=myuser&passw=mypass&cluster=mycluster">Configure with parameters</a></li>
        <li><a href="/manage?user=myuser&passw=mypass&cluster=mycluster">Manage with parameters</a></li>
    </ul>
    <p>This will auto-fill the MongoDB URL fields on both pages.</p>
    """


if __name__ == '__main__':
    app.run(debug=True)
