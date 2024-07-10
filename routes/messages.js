/** Message routes for message.ly. */
const Router = require("express").Router;
const router = new Router();

const { ensureLoggedIn } = require("../middleware/auth");
const Message = require("../models/message");
const ExpressError = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", ensureLoggedIn, async function(req, res, next) {
    try {
        let username = req.user.username;
        const message = await Message.get(req.params.id);

        // Check to make sure currently-logged-in user is either to or from user.
        if (message.from_user.username !== username && message.to_user.username !== username) {
            throw new ExpressError("You cannot read this message.", 401);
        }
        return res.json({ message });
    } catch(err) {
        return next(err);
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async function(req, res, next) {
    try {
        let from_username = req.user.username;
        let { to_username, body } = req.body;
        const message = await Message.create(from_username, to_username, body);

        return res.json({ message });
    } catch(err) {
        return next(err);
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async function(req, res, next) {
    try {
        // Compare the logged in user to the message recipient's username
        let to_username = req.user.username;
        const message = await Message.get(req.params.id);

        if (message.to_user.username !== to_username) {
            throw new ExpressError("Cannot mark this message as read", 401);
        }
        let messageRead = await Message.markRead(req.params.id);
        return res.json({ message : messageRead });
    } catch(err) {
        return next(err);
    }
})

module.exports = router;