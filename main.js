const moment = require('moment-timezone');
const date_format = 'YYYY-MM-DD';
const axios = require('axios');

module.exports = {
    isNullOrEmpty: function(str) {
        return (!str || str === '');
    },
    
    getRelativeDates: function(dateStr) {
        let d1 = this.isNullOrEmpty(dateStr) 
            ? moment().format(date_format) 
            : moment(dateStr).format(date_format);

        let d2 = moment(d1).add(1, 'days').format(date_format);
    
        return {
            'd1': d1,
            'd2': d2
        };
    },
    sendRequest: (req) => axios(req),
    sendMultipleRequests: (reqs) => axios.all(reqs)
}
