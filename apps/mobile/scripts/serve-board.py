"""Serve the unchanged v17 board at the localhost preview origin."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

BOARD = Path(__file__).resolve().parents[3] / 'design-board'


class BoardHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if urlsplit(self.path).path == '/':
            self.path = '/life-design-board-v17.html'
        super().do_GET()

    def do_HEAD(self):
        if urlsplit(self.path).path == '/':
            self.path = '/life-design-board-v17.html'
        super().do_HEAD()


if __name__ == '__main__':
    ThreadingHTTPServer(('127.0.0.1', 5181), partial(BoardHandler, directory=str(BOARD))).serve_forever()
