const {
    route
} = require("../routes/LoginRoutes");

function getRouteParent(routeNow, folder) {
    const result = routeNow.indexOf(folder)
    if (result !== -1) {
        console.log(result)
        return routeNow.substr(0, result)
    }
    return false;
}

module.exports = {
    getRouteParent
}