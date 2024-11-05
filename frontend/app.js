window.addEventListener("load", async () => {
  // Connect to Ganache
  const provider = new Web3.providers.HttpProvider("http://localhost:7545");
  web3 = new Web3(provider);
  // Request account access if needed
  await window.ethereum.request({ method: "eth_requestAccounts" });
  // We now have access to the user's account
  const accounts = await ethereum.request({ method: "eth_accounts" });
  console.log("Connected to MetaMask with account:", accounts[0]);

  // Set the selected account
  selectedAccount = accounts[0];

  try {
    const contractAddress = "0x56Ef7D70E71143eD81e8C31711f1d391A65Da864"; // Replace with your deployed contract address
    const abi = [
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "lectureId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "rollNumber",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "name": "AttendanceRecorded",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "attendance",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "lectureId",
            "type": "uint256"
          },
          {
            "internalType": "uint256[]",
            "name": "rollNumbers",
            "type": "uint256[]"
          }
        ],
        "name": "recordBatchAttendance",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "lectureId",
            "type": "uint256"
          }
        ],
        "name": "getAttendanceReport",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
      }
    ];

    proofOfAttendance = new web3.eth.Contract(abi, contractAddress);
  } catch (error) {
    console.error("Error connecting to Ganache:", error);
    alert("Failed to connect to Ganache. Please ensure Ganache is running.");
  }
});

async function recordBatchAttendance() {
  const lectureId = document.getElementById("batchLectureId").value;
  const rollNumbers = document
    .getElementById("batchRollNumbers")
    .value.split(",")
    .map((x) => parseInt(x.trim())); // Assuming roll numbers are comma-separated

  if (isNaN(lectureId) || rollNumbers.some(isNaN)) {
    document.getElementById("result").innerText = "Invalid input data.";
    return;
  }

  try {
    const result = await proofOfAttendance.methods
      .recordBatchAttendance(lectureId, rollNumbers)
      .send({
        from: selectedAccount,
        gas: 3000000, // Adjust as necessary
      })
      .on("transactionHash", (hash) => {
        document.getElementById("result").innerText =
          "Transaction submitted. Waiting for confirmation...";
        console.log("Transaction hash:", hash); // Log the transaction hash
      })
      .on("receipt", (receipt) => {
        document.getElementById("result").innerText =
          "Batch attendance recorded successfully.";
        console.log("Transaction receipt:", receipt); // Log the receipt for debugging
      })
      .on("error", (error) => {
        console.error("Transaction failed:", error);
        document.getElementById("result").innerText =
          "Error recording batch attendance. Check the console for details.";
      });
    console.log("Transaction result:", result); // Log the result for debugging
    document.getElementById("result").innerText =
      "Batch attendance recorded successfully.";
  } catch (error) {
    console.error("Error recording batch attendance:", error);
    document.getElementById("result").innerText =
      "Error recording batch attendance. Check the console for details.";
  }
}

async function findAttendanceForRollNumber() {
  const rollnumber = parseInt(document.getElementById('rollNumber').value);
  const fromBlock = 0;
  const toBlock = 'latest';
  const recordsDisplay = document.getElementById('attendanceRecords');
  recordsDisplay.innerText = ''; // Clear previous results
  console.log("Searching for attendance records for roll number:", rollnumber);

  const events = await proofOfAttendance.getPastEvents('AttendanceRecorded', {
    fromBlock: fromBlock,
    toBlock: toBlock
  });

  // Manually filter the events for the specified roll number
  const filteredEvents = events.filter(event => parseInt(event.returnValues.rollNumber) === rollnumber);

  if (filteredEvents.length === 0) {
    recordsDisplay.innerText = `No attendance records found for roll number ${rollnumber}`;
  } else {
    const uniqueEvents = new Set();

    filteredEvents.forEach((event) => {
      const lectureId = event.returnValues.lectureId;
      if (!uniqueEvents.has(lectureId)) {
        uniqueEvents.add(lectureId);
        const record = `Attendance found for roll number ${rollnumber}:\nLecture ID: ${event.returnValues.lectureId}\nTimestamp: ${new Date(event.returnValues.timestamp * 1000).toLocaleString()}\n\n`;
        recordsDisplay.innerText += record; // Append each record to the display
      }
    });
  }
  console.log(filteredEvents);
}

async function generateAttendanceReport() {
  // Retrieve the lecture ID from the input field
  const lectureId = parseInt(document.getElementById("lectureId").value);
  const attendanceReportDisplay = document.getElementById("attendanceReport");

  // Clear previous results
  attendanceReportDisplay.innerText = "Loading report...";

  if (isNaN(lectureId) || lectureId <= 0) {
    attendanceReportDisplay.innerText = "Please enter a valid lecture ID.";
    return;
  }

  try {
    // Call getAttendanceReport function and display results
    const presentRollNumbers = await proofOfAttendance.methods.getAttendanceReport(lectureId).call();

    if (presentRollNumbers.length === 0) {
      attendanceReportDisplay.innerText = `No attendance records found for Lecture ID ${lectureId}.`;
    } else {
      attendanceReportDisplay.innerText = `Roll numbers present for Lecture ID ${lectureId}: ${presentRollNumbers.join(", ")}`;
    }
  } catch (error) {
    console.error("Error fetching attendance report:", error);
    attendanceReportDisplay.innerText = "Error fetching attendance report. Please check the console for details.";
  }
}
