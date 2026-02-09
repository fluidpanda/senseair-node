### Requirements

- Node.js 22+
- A supported USB-UART adapter + SenseAir S8 (optional, mock mode works without hardware)

### Running

Download the release archive and unpack it

After unpacking you should have at least:

- `dist/`
- `package.json`
- `package_lock.json`
- `README.md`

From the unpacked directory run:

- `npm ci`

### Supported environment variables

- `SERIAL_PATH` - (`/dev/ttyUSB0`, `COM3`) optional, if not set service will try to autodetect, otherwise falls back to mocked port
- `API_PORT` - optional, HTTP API port, default: `4545`
- `POLL_INTEVAL_MS` - optional, sensor polling interval, default: `5000`

### Run

Linux with env:

```bash
SERIAL_PATH=/dev/ttyUSB0 API_PORT=4545 POLL_INTERVAL_MS=5000 npm dist/main.js
```

Windows with env:

```bat
set SERIAL_PATH=COM3
set API_PORT=4545
set POLL_INTERVAL_MS=5000
node dist/main.js
```

Linux and windows with default settings:

```
npm dist/main.js
```

### Check status

```bash
curl http://localhost:4545/status
```
