// Ensure you have the necessary Web3 library loaded
// Example: <script src="https://cdn.jsdelivr.net/npm/web3@1.5.2/dist/web3.min.js"></script>

window.addEventListener("load", async () => {
  // Connect to Ganache
  const provider = new Web3.providers.HttpProvider("http://localhost:7545");
  web3 = new Web3(provider);

  try {
    const accounts = await web3.eth.getAccounts();
    console.log("Connected to Ganache with accounts:", accounts);

    // Populate dropdown with accounts
    const accountDropdown = document.getElementById("accountDropdown");
    accounts.forEach((account) => {
      const option = document.createElement("option");
      option.value = account;
      option.textContent = account;
      accountDropdown.appendChild(option);
    });

    const contractAddress = "0xF47d6b65722f06567DAFC4f24935Ae93F092a806"; // Replace with your deployed contract address
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
  const selectedAccount = document.getElementById("accountDropdown").value;

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
  const rollNumber = document.getElementById('rollNumber').value;
  const fromBlock = 0;
  const toBlock = 'latest';
  const recordsDisplay = document.getElementById('attendanceRecords');
  recordsDisplay.innerText = ''; // Clear previous results


  const events = await proofOfAttendance.getPastEvents('AttendanceRecorded', {
    filter: { rollNumbers: rollNumber }, // Filter events by the specific roll number
    fromBlock: fromBlock,
    toBlock: toBlock
  });

  if (events.length === 0) {
    recordsDisplay.innerText = `No attendance records found for roll number ${rollNumber}`;
  } else {
    const uniqueEvents = new Set();

    events.forEach((event) => {
      const lectureId = event.returnValues.lectureId;
      if (!uniqueEvents.has(lectureId)) {
        uniqueEvents.add(lectureId);
        const record = `Attendance found for roll number ${rollNumber}:\nLecture ID: ${event.returnValues.lectureId}\nTimestamp: ${new Date(event.returnValues.timestamp * 1000).toLocaleString()}\n\n`;
        recordsDisplay.innerText += record; // Append each record to the display
      }
    });
  }
  console.log(events);

  async function getAttendanceReport(lectureId) {
    const events = await contract.getPastEvents('AttendanceRecorded', {
      filter: { lectureId: lectureId },
      fromBlock: 0,
      toBlock: 'latest'
    });
  
    const presentRollNumbers = new Set(); // To store unique roll numbers
  
    events.forEach((event) => {
      const recordedRollNumbers = event.returnValues.rollNumbers;
      recordedRollNumbers.forEach((rollNumber) => {
        presentRollNumbers.add(rollNumber); // Add each roll number to the set
      });
    });
  
    // Convert the set to an array if needed
    const resultArray = Array.from(presentRollNumbers);
  
    // Display or return the result
    console.log(`Roll numbers present for Lecture ID ${lectureId}:`, resultArray);
    return resultArray;
  }

}
