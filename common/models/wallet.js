'use strict';

module.exports = function(Wallet) {

    /**
     * create a transaction
     * @param {Object} data
     *      {number} data.amount
     *      {object} data.details
     *      {string} data.type
     * @param {function} callback
     *      callback called with (error, transaction)
     * @author Habbes
     * @added 13.10.2016
     * @version 1
     */
    Wallet.prototype.createTransaction = function(data, callback) {

        /*TODO WARNING: this is not an atomic transaction and is susceptible
        to race conditions. Don't do this in a real app
        */

        if(data.amount > this.balance){
            let err = new Error('Insufficient balance');
            err.code = 'INSUFFICIENT_BALANCE';
            err.statusCode = 400;
            return callback(err);
        }

        this.balance -= data.amount;
        this.save(err => {
            if(err) return callback(err);
            this.transactions.create(data, callback);
        });
    };

    /**
     * credit the wallet
     * @param {Number} amount
     * @param {Function} callback
     *      called with (Error, WalletTransaction)
     * @author Habbes
     * @added 13.10.2016
     * @version 1      
     */
    Wallet.prototype.load = function(amount, callback){
        const types = Wallet.app.models.WalletTransaction.Type;
        let data = {
            amount: -amount,
            type: types.LOAD,
            details: {}
        };
        this.createTransaction(data, callback);
    };

    /**
     * handles calls to load wallet via API
     * credits the wallet with the specified amount 
     * and retuns the wallet as response
     * @param {Number} amount
     * @param {Function} callback
     *      args: (Error, Wallet)
     * 
     * @author Habbes
     * @added 13.10.2016
     * @version 1
     */
    Wallet.prototype.loadRemoteHandler = function(amount, callback){
        this.load(amount, (err, tx) => {
            return callback(err, this);
        });
    };

    /**
     * registers remote wallet/:id/load API endpoint
     * @author Habbes
     * @added 13.10.2016
     * @version 1
     */
    Wallet.remoteMethod('loadRemoteHandler', {
        isStatic: false,
        accepts: [
            { arg: 'amount', type: 'number' }
        ],
        returns: { arg: 'wallet', type: 'object', root: true },
        http: { path: '/load', verb: 'post' }
    });

};
