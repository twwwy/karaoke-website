from flask import render_template, request, jsonify, current_app
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired

from youtube_search import YoutubeSearch

from website.main import bp
from website.main.utils import download_audio

class SearchForm(FlaskForm):
    searchText = StringField('', validators=[DataRequired()])
    submitSearch = SubmitField('Search')

@bp.route('/')
def karaoke():
    form = SearchForm()
    return render_template('youtubeplayer.html', form=form)


@bp.route('/search_result', methods=['POST'])
def search():
    text = request.form['search_text']
    results = YoutubeSearch(text, max_results=5)
    i = 0
    while len(results.videos) == 0:
        print('search again  ' + str(i))
        current_app.logger.debug('search again' + str(i))
        results = YoutubeSearch(text, max_results=5)
        i += 1
        if i > 2:
            break

    res_json = results.to_json()
    return res_json

@bp.route("/tasks", methods=["POST"])
def run_task():
    audio_url = request.form['url']
    _video_id = request.form['_video_id']
    task = current_app.task_queue.enqueue(download_audio, audio_url, _video_id)
    response_object = {
        "status": "success",
        "data": {
            "task_id": task.get_id()
        }
    }
    return jsonify(response_object), 202

@bp.route("/tasks/<task_id>", methods=["GET"])
def get_status(task_id):
    task = current_app.task_queue.fetch_job(task_id)
    print(task, flush=True)
    if task:
        response_object = {
            "status": "success",
            "data": {
                "task_id": task.get_id(),
                "task_status": task.get_status(),
                "task_result": task.result,
            },
        }
    else:
        response_object = {"status": "error"}
    return jsonify(response_object)

