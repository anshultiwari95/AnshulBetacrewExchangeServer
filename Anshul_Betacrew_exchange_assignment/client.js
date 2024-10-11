const net = require("net");
const fs = require("fs");

// Server address and port
const HOST = "127.0.0.1";
const PORT = 3000;

let receivedPackets = [];
let missingSequences = [];
let lastSequence = 0;

// Create TCP client and connect to the server
const client = new net.Socket();

client.connect(PORT, HOST, () => {
  console.log("Connected to BetaCrew Exchange Server");
  sendRequest(client, 1); // Call Type 1: Stream all packets
});

client.on("data", (data) => {
  handleResponse(data); // Process data when received
});

client.on("close", () => {
  console.log("Connection closed by server");

  // After the connection is closed, we check for missing sequences
  if (missingSequences.length > 0) {
    console.log(`Missing sequences found: ${missingSequences}`);
    requestAllMissingSequences(client); // Request all missing packets using the same client
  }
  // No missing sequences, save data directly
  fs.writeFileSync("stock_data.json", JSON.stringify(receivedPackets, null, 2));
  console.log("All packets received and written to stock_data.json");
});

client.on("error", (err) => {
  console.error(`Error: ${err.message}`);
});

client.on("timeout", () => {
  console.error("Connection timed out");
});

// Function to send request to the server
function sendRequest(socket, callType, resendSeq = 0) {
  const buffer = Buffer.alloc(2); // 2 bytes for callType and resendSeq
  buffer.writeUInt8(callType, 0); // Write callType (1 = stream, 2 = resend)
  buffer.writeUInt8(resendSeq, 1); // Write resendSeq only if callType = 2
  socket.write(buffer);
}

// Function to handle the incoming data from the server
function handleResponse(data) {
  const packetSize = 17; // Fixed packet size (4 + 1 + 4 + 4 + 4 bytes)

  // Loop through received data to extract packets
  for (let i = 0; i < data.length; i += packetSize) {
    const packet = data.slice(i, i + packetSize);

    const symbol = packet.slice(0, 4).toString("ascii");
    const buySellIndicator = packet.slice(4, 5).toString("ascii");
    const quantity = packet.readInt32BE(5);
    const price = packet.readInt32BE(9);
    const sequence = packet.readInt32BE(13);

    // Check if the packet is already in the list to avoid duplicates
    if (!receivedPackets.find((p) => p.sequence === sequence)) {
      receivedPackets.push({
        symbol,
        buySellIndicator,
        quantity,
        price,
        sequence,
      });
    }

    // Check for missing sequences
    if (sequence !== lastSequence + 1 && lastSequence !== 0) {
      for (
        let missingSeq = lastSequence + 1;
        missingSeq < sequence;
        missingSeq++
      ) {
        if (!missingSequences.includes(missingSeq)) {
          // pushing missing data quotes
          missingSequences.push(missingSeq);
        }
      }
    }
    lastSequence = sequence;
  }
}

// Function to request all missing sequences using the same client
function requestAllMissingSequences() {
  if (missingSequences.length === 0) {
    // No missing packets, save directly
    console.log("No missing packets. Saving data to stock_data.json");
    return;
  }

  // Iterate over all missing sequences and send a request for each one
  console.log(`Requesting missing sequences: ${missingSequences}`);

  missingSequences.forEach((seq, index) => {
    setTimeout(() => {
      console.log(`Requesting missing packet with sequence: ${seq}`);
      const resendClient = new net.Socket();
      resendClient.connect(PORT, HOST, () => {
        sendRequest(resendClient, 2, seq); // Call Type 2: Resend packet for each sequence
      });
      resendClient.on("data", (data) => {
        // adding missing data back into receivedPackets
        handleResponse(data);
        // closing client after fetching missing packet
        resendClient.destroy();
      });

      resendClient.on("close", () => {
        console.log(`Resent packet ${seq} received`);
        // If all missing packets are received, save the data
        fs.writeFileSync("stock_data.json", JSON.stringify(receivedPackets, null, 2));
      });

      resendClient.on("error", (err) => {
        console.error(`Error requesting packet ${seq}: ${err.message}`);
      });
    }, index * 500); // Slight delay between requests to avoid congestion while running
  });
}



