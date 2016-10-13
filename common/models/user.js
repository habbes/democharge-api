module.exports = function(User) {

    /**
     * hook to create wallet when user is created
     * @author Habbes
     * @added 13.10.2016
     * @version 1
     */
    User.observe('before save', (context, next) => {
        if(!context.isNewInstance){
            return next();
        }
        let user = context.instance;
        user.wallet.create(next);
    });
};
