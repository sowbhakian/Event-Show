function check(start, end, regs) {
    var s = new Date(start)
    var e = new Date(end)
    var r = new Date(regs)
    if (r < (s && e)) {
        if (s <= e) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
    console.log("asdasdas");
}

module.exports = { check };