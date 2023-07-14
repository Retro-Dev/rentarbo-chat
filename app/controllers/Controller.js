"use strict";

const _ = require("lodash");

class Controller {

    constructor() {
        this.__is_error    = false;
        this.__is_paginate = true;
        this.__collection  = true;
        this.__is_paginate = true;
    }

    async __sendResponse(params = {},resource, result, response_code, message,is_collection= 0) 
    {      
        if (resource != "") {
            let resourceClass = require("../resources/" + resource + ".js");
            resource = new resourceClass();

            if(typeof result.id != "undefined" && result.id > 0){              
                result = await resource.make(params,result);
            }
            if (typeof result.length != "undefined" && result.length > 0 && is_collection == 1) {
                result = await resource.collection(params,result);
            }
        }
        let response = await {
            'code': response_code,
            'data': (typeof result != "undefined") ? result : [],
            'message': message
        };
        return await response;
    }


    async __sendErrors(error, errorMessages = [], code = 404) {

        let response = {
            'code': code,
            'data': errorMessages,
            'message': error
        };

        return response;
    }

    
    /**
     *
     * @param {*} validator
     * @returns
     */
     async webValidateRequestParams(validator = [])
     {
        return this.setValidatorMessagesResponse( validator.messages() , 'web' );
     }

    /**
     *
     * @param validator
     * @returns {Promise<void>}
     */
    async validateRequestParams(validator = [])
    {
        if (!_.isEmpty(validator) && validator.fails()) {
            this.__is_error = true;
            this.sendError(
              Antl.formatMessage('messages.validation_msg'),
              this.setValidatorMessagesResponse( validator.messages() , 'api' ),
              400
            );
            return;
        }
    }

    /**
     *
     * @param {*} messages
     * @returns
     */
    setValidatorMessagesResponse( messages , type = 'api' )
    {
        let error_messages = type == 'api' ? {} : '';
        if( messages.length > 0 ){
            for( var i=0; i < messages.length; i++ )
            {
                if( type == 'api' )
                  error_messages[messages[i].field] = messages[i].message;
                else
                  error_messages += '<p>'+ messages[i].message +'</p>';
            }
        }
        return error_messages;
    }

    /**
     *
     * @param code
     * @param message
     * @param data
     * @returns {Promise<void>}
     */
    async sendResponse(code = 200, message = "success", data = [])
    {
        let links = this.paginateLinks(data);
        let results = this.__is_paginate ? data.data : data;
        let obj = {};
        if (this.__collection) {
            let resource = this.loadResource();
            results = await resource.initResponse(results,this.request);

            obj.code = code;
            obj.message = message;
            obj.data = results;
            obj.links = links;
        } else {
            obj.code = code;
            obj.message = message;
            obj.data = results;
            obj.links = links;
        }
        this.response.status(code).send(obj);
        return;
    }

     /**
     *
     * @param data
     * @returns {{next: null, last: null, prev: null, first: null}|{next: number, per_page: number, total: (number|number), current: number, prev: number}}
     */
      paginateLinks(data)
      {
        let links = {};
        if (this.__is_paginate) {
            var total_page = Math.round(
                parseInt(data.total) / parseInt(data.perPage)
            );
            links = {
                total: total_page > 0 ? total_page : 1,
                per_page: data.perPage,
                current: data.page,
                prev: parseInt(data.page) - 1,
                next: parseInt(data.page) + 1,
            };
        } else {
            links = {
                first: null,
                last: null,
                prev: null,
                next: null,
            };
        }
        return links;
    }

    /**
     *
     * @param error
     * @param error_messages
     * @param http_code
     */
    sendError( error = '', error_message = [], http_status_code = 400)
    {
        let obj = {
            code: http_status_code,
            message: error,
            data: error_message,
        };
        this.response.status(http_status_code).send(obj);
        return;
    }

    /**
     *
     * @returns {*}
     */
    loadResource()
    {
        return use("App/Controllers/Http/Resource/" + this.resource);
    }

    static async socketValidate(rules, params) {
        const validation = await validate(params, rules)
        if (validation.fails()) {
            let error
            let validationObject = validation.messages()[0]
            // For unique email
            error = validationObject.message;
            
            return await this.socketError(error, params)
        }
        return true
    }

    static async socketError(message, response, code = 400) {
        return{
            status: false,
            code: code,
            message,
            data: [],
        }
    }

    static async socketSuccess(data, message, response, code = 200) {
        return{
            status: true,
            code: code,
            message,
            data,
        }
    }

}

module.exports = Controller;
