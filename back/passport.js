var LdapStrategy = require('passport-ldapauth')
const config = require('./config.js')

const db = require('./db.js')

module.exports = function (passport) {
    passport.use(
        new LdapStrategy({
            server: {
                url: 'ldaps://ldap.hyris.tv/',
                searchBase: 'ou=people,dc=hyris,dc=tv',
                searchFilter: '(|(cn={{username}})(uid={{username}}))',

                // Adapt these to the credentials of your app !
                bindDN: 'cn=matos,ou=apps,dc=hyris,dc=tv',
                bindCredentials: config.LDAP_MDP,
            },
        })
    )

    passport.serializeUser(function (user, done) {
        return done(null, user)
    })

    passport.deserializeUser(function (user, done) {
        return done(null, user)
    })
}
