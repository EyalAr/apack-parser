module.exports = {

    DURATION_UNITS: {
        "": 1, // no units defaults to ms
        "ms": 1,
        "msec": 1,
        "msecs": 1,
        "millisecond": 1,
        "milliseconds": 1,
        "s": 1000,
        "sec": 1000,
        "secs": 1000,
        "seconds": 1000,
        "m": 1000 * 60,
        "min": 1000 * 60,
        "mins": 1000 * 60,
        "minutes": 1000 * 60,
        "h": 1000 * 60 * 60,
        "hr": 1000 * 60 * 60,
        "hrs": 1000 * 60 * 60,
        "hour": 1000 * 60 * 60,
        "hours": 1000 * 60 * 60,
    },

    SYNTAX_DECS: [{
        name: "durationMarks",
        type: "array"
    }, {
        name: "tagMarks",
        type: "array"
    }, {
        name: "actionsDelimiter",
        types: ["regexp", "string"]
    }, {
        name: "parametersDelimiter",
        types: ["regexp", "string"]
    }, {
        name: "commentPrefix",
        types: ["regexp", "string"]
    }, {
        name: "actions",
        type: "array"
    }]

};
