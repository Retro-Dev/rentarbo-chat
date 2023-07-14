const regex = /([a-z]+\:\/+)([^\/\s]*)([a-z0-9\-@\^=%&;\/~\+]*)[\?]?([^ \#]*)#?([^ \#]*)/ig;
class UserShortInfo {
    async make(params,data) {
        var image = (regex.exec(data.image_url) != null) ? data.image_url : __php_base_url + data.image_url;
        let response = {
            "id": data.id,
            'name': data.name,
            "image_url": ((data.image_url != null)) ? __image_url + data.image_url : __php_base_url + '/images/user-placeholder.png',
            "online_status": data.online_status,
            "is_anonymous": (typeof data.is_anonymous != "undefined" && data.is_anonymous > 0) ? data.is_anonymous : 0
        }
        return response;
    }

    async collection(params,data) {
        let response = [];
        if (data.length > 0) {
            for (var i= 0; i < data.length; i++){
                var image = (regex.exec(data[i].image_url) != null) ? data[i].image_url : __user_image_url + data[i].image_url;
                response.push({
                    "id": data[i].id,
                    'name': data.name,
                    "image_url": ((data[i].image_url != null)) ? __image_url + data.image_url : __php_base_url +'/images/user-placeholder.png',
                    "online_status": data[i].online_status,
                    "is_anonymous": (typeof data[i].is_anonymous != "undefined" && data[i].is_anonymous > 0) ? data[i].is_anonymous : 0,
                });
            }
        }
        return await response;
    }
}

module.exports = UserShortInfo
