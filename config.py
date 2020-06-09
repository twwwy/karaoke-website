import os
from os.path import join, dirname, realpath

basedir = os.path.abspath(os.path.dirname(__file__))

class BaseConfig(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'ITS_A_RAINY_DAY'
    WTF_CSRF_ENABLED = True
    DEBUG = True
    REDIS_URL = "redis://"
    QUEUES = ["default"]
    UPLOADS_PATH = join(dirname(realpath(__file__)), 'website/static/downloads/')

class DevelopmentConfig(BaseConfig):
    """Development configuration."""

    WTF_CSRF_ENABLED = False


class TestingConfig(BaseConfig):
    """Testing configuration."""

    TESTING = True
    WTF_CSRF_ENABLED = False
    PRESERVE_CONTEXT_ON_EXCEPTION = False