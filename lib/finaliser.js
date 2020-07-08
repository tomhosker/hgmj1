/*
This code contains a class which handles any final, universal touches to the
page before it's passed to the browser.
*/

// The class in question.
class Finaliser
{
  constructor()
  {

  }

  // Ronseal.
  static fixApostrophes(input)
  {
    while(input.indexOf("``") >= 0)
    {
      input = input.replace("``", "&ldquo;");
    }
    while(input.indexOf("''") >= 0)
    {
      input = input.replace("''", "&rdquo;");
    }
    while(input.indexOf("`") >= 0)
    {
      input = input.replace("`", "&lsquo;");
    }
    while(input.indexOf("'") >= 0)
    {
      input = input.replace("'", "&rsquo;");
    }
    return input;
  }

  // Ronseal.
  static fixDashes(input)
  {
    while(input.indexOf("---") >= 0)
    {
      input = input.replace("---", "&mdash;");
    }
    while(input.indexOf("--") >= 0)
    {
      input = input.replace("--", "&ndash;");
    }
    return input;
  }

  // Adds a link to the secret area, in the footer, or doesn't.
  static getSecretLink(req)
  {
    var secretLink = "| <a href=\"/secret\">Secret Area</a>";

    if(req.user === undefined) return "";
    else if(req.user.username === "admin") return secretLink;
    else return "";
  }

  // Render, and deliver the page to the browser.
  protoRender(req, res, view, properties)
  {
    var date = new Date();

    properties.footstamp = date.toISOString();
    properties.secretLink = Finaliser.getSecretLink(req);

    res.render(view, properties, function(err, html){
      if(html === undefined)
      {
        res.render(view, properties);
      }
      else
      {
        html = Finaliser.fixApostrophes(html);
        html = Finaliser.fixDashes(html);
        res.send(html);
      }
    });
  }
}

// Exports.
module.exports = Finaliser;
