# Mac App Launcher / Mac 一键启动

## 中文

在 Mac mini 上打开 `orchestra-v2` 文件夹，双击：

```text
Orchestra v2.app
```

它会自动：

1. 在后台启动 `orchestrator_v2.py`
2. 监听 `0.0.0.0:8420`
3. 打开 `http://127.0.0.1:8420`

以后如果已经在运行，再双击 `Orchestra v2.app` 只会重新打开 Dashboard。

要停止后台服务，双击：

```text
Stop Orchestra v2.app
```

如果你想从 Mac Pro 打开 Mac mini 上的 Dashboard，用：

```text
http://<Mac mini 的 Tailscale 或局域网 IP>:8420
```

例如原来的 Mac mini 地址如果是 `100.108.145.51`，就是：

```text
http://100.108.145.51:8420
```

## English

On the Mac mini, open the `orchestra-v2` folder and double-click:

```text
Orchestra v2.app
```

It automatically starts `orchestrator_v2.py` in the background, listens on
`0.0.0.0:8420`, and opens `http://127.0.0.1:8420`.

To stop the background service, double-click:

```text
Stop Orchestra v2.app
```
