// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProofOfAttendance {
    // Mapping from lecture ID to roll number to attendance status
    mapping(uint256 => mapping(uint256 => bool)) public attendance; // uint256 for roll numbers

    event AttendanceRecorded(uint256 lectureId, uint256 rollNumber, uint256 timestamp);

    // Record attendance for a batch of roll numbers in a lecture
    function recordBatchAttendance(uint256 lectureId, uint256[] memory rollNumbers) public returns (bool) {
        require(lectureId > 0, "Invalid Lecture ID"); // Ensure valid lecture ID
        require(rollNumbers.length > 0, "No roll numbers provided"); // Ensure roll numbers are provided
        for (uint i = 0; i < rollNumbers.length; i++) {
            uint256 rollNumber = rollNumbers[i];
            attendance[lectureId][rollNumber] = true;
            emit AttendanceRecorded(lectureId, rollNumber, block.timestamp);
        }
        return true;
    }

    // Function to generate a report for a specific lecture ID
    function getAttendanceReport(uint lectureId) public view returns (uint[] memory) {
        uint count = 0;

        // Count how many roll numbers have true values
        for (uint rollNumber = 0; rollNumber < 500; rollNumber++) { // assuming 500 roll numbers
            if (attendance[lectureId][rollNumber]) {
                count++;
            }
        }

        // Create an array to hold those roll numbers
        uint[] memory presentRollNumbers = new uint[](count);
        uint index = 0;

        for (uint rollNumber = 0; rollNumber < 500; rollNumber++) {
            if (attendance[lectureId][rollNumber]) {
                presentRollNumbers[index] = rollNumber;
                index++;
            }
        }

        return presentRollNumbers;
    }
}
