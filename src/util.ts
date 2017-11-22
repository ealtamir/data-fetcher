import * as _ from 'lodash'

class Util {
    public static formatNumber(val: number) {
        if (_.isNaN(val) || !_.isNumber(val) || !_.isFinite(val) || _.isNil(val)) {
            return 0
        }
        return val
    }
}

export {
    Util
}