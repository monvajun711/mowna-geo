#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
魔女GEO · 一键部署脚本（零依赖）

用法:
    python deploy.py                      # 复制到 ./魔女GEO
    python deploy.py ./my-geo             # 复制到指定目录
    python deploy.py ./魔女GEO --serve    # 复制并启动本地服务
    python deploy.py --serve --port 8080  # 指定端口

启动后浏览器访问 http://localhost:<port>
"""

import argparse
import http.server
import os
import shutil
import socketserver
import sys

# 本文件位于 <skill>/scripts/，因此 skill 根目录是上一级
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, "assets", "geo-quest")
DEFAULT_DEST = "魔女GEO"


def deploy(dest):
    dest = os.path.abspath(dest)
    os.makedirs(dest, exist_ok=True)
    src = os.path.abspath(SRC)

    if not os.path.isdir(src):
        print("[错误] 找不到学习台资源目录：%s" % src)
        return None

    # 覆盖式复制：不做删除，避免破坏性操作（也避免误删用户已有文件）
    for item in os.listdir(src):
        s = os.path.join(src, item)
        d = os.path.join(dest, item)
        if os.path.isdir(s):
            shutil.copytree(s, d, dirs_exist_ok=True)
        else:
            shutil.copy2(s, d)

    print("[完成] 学习台已部署到：%s" % dest)
    print("       直接双击 index.html 即可打开（无需联网、无需安装）")
    print("       若浏览器限制 file:// 下的 localStorage，请用 --serve 启动本地服务")
    return dest


def serve(root, port):
    # 注意：必须显式传 directory，不能靠 functools.partial —— partial 的关键字参数
    # 只在「调用」时生效，若再对其 .func 做子类化，directory 绑定会丢失，
    # 结果会退化成服务当前工作目录。
    class QuietHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=root, **kwargs)

        def log_message(self, *a, **k):
            pass

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), QuietHandler) as httpd:
        url = "http://localhost:%d" % port
        print("")
        print("=" * 52)
        print("  魔女GEO 学习台已启动")
        print("  %s" % url)
        print("  根目录：%s" % root)
        print("  按 Ctrl+C 停止")
        print("=" * 52)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[已停止]")


def main():
    ap = argparse.ArgumentParser(description="魔女GEO · 一键部署")
    ap.add_argument("dest", nargs="?", default=DEFAULT_DEST, help="目标目录（默认 ./%s）" % DEFAULT_DEST)
    ap.add_argument("--serve", action="store_true", help="部署后启动本地服务")
    ap.add_argument("--port", type=int, default=8000, help="服务端口（默认 8000）")
    args = ap.parse_args()

    dest = deploy(args.dest)
    if not dest:
        return 1

    if args.serve:
        serve(dest, args.port)
    return 0


if __name__ == "__main__":
    sys.exit(main())
