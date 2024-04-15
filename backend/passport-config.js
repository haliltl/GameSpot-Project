const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/User');

module.exports = function(passport) {
    passport.use(new LocalStrategy({usernameField: 'username'},
        async (username, password, done) => {
            const user = await User.findOne({ username: username });
            if (!user) {
                return done(null, false, { message: 'No user with that username' });
            }

            try {
                if (await bcrypt.compare(password, user.password)) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password incorrect' });
                }
            } catch (e) {
                return done(e);
            }
        }));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        User.findById(id).then((err, user) => {
            done(err, user);
        });
    });
};