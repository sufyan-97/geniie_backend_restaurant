const rpcClient = require('./rpcClient');
const redisClient = require('../../config/redis');


exports.getAppControls = function (key, defaultValue) {
    return new Promise((resolve, reject) => {
        redisClient.get('appControls', function (err, appControls) {
            if (err) {
                reject(err)
                return
            }
            try {
                let parsedAppControls = JSON.parse(appControls)
                if (appControls) {
                    let appControlObj = parsedAppControls.find((appControl) => appControl.key === key)
                    if (!appControlObj) {
                        resolve(defaultValue)
                        return
                    }
                    resolve(appControlObj.value)
                    return
                }

                // console.log(rpcClient.MainService)
                rpcClient.MainService.GetAppControls({
                }, async (error, respAppControls) => {
                    if (error) {
                        reject(error)
                        return
                    }
                    try {
                        await redisClient.set('appControls', respAppControls.data, 'EX', 1800)
                        parsedAppControls = JSON.parse(respAppControls.data);
                        let appControlObj = parsedAppControls.find((appControl) => appControl.key === key)
                        if (!appControlObj) {
                            resolve(defaultValue)
                            return
                        }
                        resolve(appControlObj.value)
                        return
                    } catch (error) {
                        reject(error)
                        return
                    }
                })

            } catch (error) {
                reject(error)
                return
            }
        })
    })
}
