const ProofOfAttendance = artifacts.require("ProofOfAttendance");

module.exports = function(deployer) {
    deployer.deploy(ProofOfAttendance, { gas: 6000000 });
};
