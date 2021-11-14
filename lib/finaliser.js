/*
This code contains a class which handles any final, universal touches to the
page before it's passed to the browser.
*/

// The class in question.
class Finaliser {
    constructor() {}

    // Ronseal.
    static fixApostrophes(input) {
        while (input.indexOf("``") >= 0) {
            input = input.replace("``", "&ldquo;");
        }
        while (input.indexOf("''") >= 0) {
            input = input.replace("''", "&rdquo;");
        }
        while (input.indexOf("`") >= 0) {
            input = input.replace("`", "&lsquo;");
        }
        while (input.indexOf("'") >= 0) {
            input = input.replace("'", "&rsquo;");
        }
        return input;
    }

    // Ronseal.
    static fixDashes(input) {
        while (input.indexOf("---") >= 0) {
            input = input.replace("---", "&mdash;");
        }
        while (input.indexOf("--") >= 0) {
            input = input.replace("--", "&ndash;");
        }
        return input;
    }

    // Add a link to log out, if we're currently loggged in.
    static getLogoutLink(req) {
        const logoutLink = '| <a href="/logout">Log out</a>';

        if (!req.user || !req.user.username) return "";

        return logoutLink;
    }

    // Render, and deliver the page to the browser.
    protoRender(req, res, view, properties) {
        let date = new Date();

        properties.footstamp = date.toISOString();
        properties.logoutLink = Finaliser.getLogoutLink(req);

        res.render(view, properties, function (err, html) {
            if (html === undefined) {
                res.render(view, properties);
            } else {
                html = Finaliser.fixApostrophes(html);
                html = Finaliser.fixDashes(html);
                res.send(html);
            }
        });
    }
}

// Exports.
module.exports = Finaliser;
