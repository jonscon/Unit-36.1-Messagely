/** Auth routes for message.ly */
const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const router = new Router();

const { SECRET_KEY } = require("../config");
const User = require("../models/user");
const ExpressError = require("../expressError");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async function (req, res, next) {
    try {
        const { username, password } = req.body;
        const result = await User.authenticate(username, password);
        if (result) {
            await User.updateLoginTimestamp(username);
            let token = jwt.sign({ username }, SECRET_KEY);
            return res.json({ token });
        }
        else {
            throw new ExpressError("Invalid username/password", 400);
        }
    } catch(err) {
        return next(err);
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function(req, res, next) {
    try {
        const { username } = await User.register(req.body);
        await User.updateLoginTimestamp(username);
        let token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token });
    } catch(err) {
        return next(err);
    }
})

module.exports = router;