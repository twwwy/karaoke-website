from pytube import YouTube
from spleeter.separator import Separator
from spleeter.audio.adapter import get_default_audio_adapter

import os
import glob

def download_audio(audio_url, _video_id):
    pre_url = 'https://youtube.com'
    url = pre_url + audio_url
    path = os.path.join(os.path.dirname(os.path.realpath(__file__))[:-5], 'static/downloads/')
    print(path, flush=True)
    title = audio_url[9:]
    filename = title + '.mp4'

    yt = YouTube(url)

    try:
        if not os.path.exists(path + filename):
            print('downloading audio...' + filename, flush=True)
            yt.streams.get_audio_only().download(path)
            print('download finished', flush=True)

            list_of_files = glob.glob(path + '*.mp4')
            latest_file = max(list_of_files, key=os.path.getctime)  # absolute path
            print(f'latest_file: {latest_file}', flush=True)
            os.rename(latest_file, path + filename)
            print('renamed \n' + path + filename, flush=True)
            # separation_folder = latest_file.partition('static/downloads/')[2][:-4]
        else:
            print(filename + ' already downloaded. Proceed to separate...', flush=True)
        separation_folder = title
        if not os.path.exists(path + separation_folder):
            print('Starting separation', flush=True)
            _split_audio(path, path + filename) # separate audio files
            print('separation done, serving file...', flush=True)
            os.remove(path + filename) # remove original audio file
        else:
            # print(path + separation_folder, flush=True)
            print('already separated. Proceed to serve', flush=True)

        # print('static/downloads/' + latest_file[:-4] + '/' + 'accompaniment.mp3')
        return {'url': 'static/downloads/' + separation_folder + '/' + 'accompaniment.mp3',
                '_video_id': _video_id}
        # return send_from_directory(path + filename[:-4], 'accompaniment.mp3')
    except Exception as e:
        return str(e)

def _split_audio(path, filename):
    """
    called within the function download_audio() to process original .mp4 file and separate
    the vocal and accompaniment. The files are stored locally in path/{file name}/
    vocals.mp3 ,or accompaniment.mp3
    """
    separator = Separator('spleeter:2stems')
    audio_loader = get_default_audio_adapter()
    sample_rate = 44100
    print('_load mp3 for splitting', flush=True)
    print(filename)
    waveform, _ = audio_loader.load(filename, sample_rate=sample_rate)
    prediction = separator.separate(waveform)
    print('_ready to separate', flush=True)
    separator.separate_to_file(filename, path, codec='mp3')
    print('separation done', flush=True)
