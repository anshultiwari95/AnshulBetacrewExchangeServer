
# BetaCrew Exchange Server Assignment By Anshul Tiwari

This project demonstrates how to run a client for the given server, where the client fetches all the packets with a retry mechanism.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed on your local machine. You can download it from [Node.js Official Website](https://nodejs.org/).

## Project Structure

```bash
├── main.js     # TCP Server code
├── client.js   # TCP Client code
├── run.js      # Script to run both server and client
├── stock_data.json  # File to store the received data
├── README.md   # Documentation
```

## How to Run the Project

You can run both the server (`main.js`) and the client (`client.js`) simultaneously using the provided `run.js` script.

### Steps:

1. **Run the project**:
   To start both the server and the client, simply run the following command:

   ```bash
   node run.js
   ```

   The `run.js` script will:
   - Start the server (`main.js`) in the background.
   - Wait for 5 seconds to allow the server to fully start.
   - Start the client (`client.js`) to fetch data from the server.

2. **Check the Output**:
   - The client will process the data and save it in a file named `stock_data.json` in the project directory.
   - You can view the received packets by opening the `stock_data.json` file.

### Example Output:

If the server sends two packets, you might see a JSON output like this in `stock_data.json`:

```json
[
  {
    "symbol": "AAPL",
    "buySellIndicator": "B",
    "quantity": 50,
    "price": 100,
    "sequence": 1
  },
  {
    "symbol": "AAPL",
    "buySellIndicator": "B",
    "quantity": 40,
    "price": 98,
    "sequence": 2
  }
]
```

## File Descriptions

### `main.js`

This is the server-side script that simulates sending stock ticker data to the client. It listens on port `3000` and sends data packets at regular intervals to any connected client.

### `client.js`

This is the client-side script that connects to the server, requests data, and processes incoming data packets. It also handles any missing packets by sending resend requests to the server.

### `run.js`

This script orchestrates the running of both the server and the client:
- Starts the server in the background.
- After a short delay, starts the client to fetch data from the server.
- Cleans up the processes once data has been received.

## Stopping the Application

You can stop the processes by closing the terminal or pressing `Ctrl + C` in the terminal window where you ran `node run.js`.

---

### Note:

- Make sure that port `3000` is available on your machine.
- Ensure the server starts properly before the client tries to fetch the data. The `run.js` script includes a delay of 2 seconds to give the server time to start.
    