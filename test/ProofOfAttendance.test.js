const ProofOfAttendance = artifacts.require("ProofOfAttendance");

contract("ProofOfAttendance", accounts => {
    const eventId = 1;
    const attendee = accounts[0];

    it("should record attendance", async () => {
        const instance = await ProofOfAttendance.deployed();
        await instance.recordAttendance(eventId, { from: attendee });

        const attendance = await instance.eventAttendance(eventId, 0);
        assert.equal(attendance.attendee, attendee, "Attendee was not recorded correctly");
    });

    it("should verify attendance", async () => {
        const instance = await ProofOfAttendance.deployed();
        const result = await instance.verifyAttendance(eventId, attendee);

        assert.equal(result, true, "Attendance verification failed");
    });

    it("should return user events", async () => {
        const instance = await ProofOfAttendance.deployed();
        const events = await instance.getUserEvents(attendee);

        assert.equal(events.length, 1, "User events not returned correctly");
    });
});
