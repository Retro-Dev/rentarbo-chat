
class User {
    async make(params,data){
        data.jist_image_url = __user_image_url + data['jist_image_url']
        return data;
    }

    async collection(params,data){
        return  data;
    }
}

module.exports = User
