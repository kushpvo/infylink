const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  isAdmin: Boolean,
  resetToken: String,
  resetTokenExpiration: Date,
  links: [
    {
      title: { type: String },
      url: { type: String },
      highlight: { type: Boolean }
    }
  ]
});

userSchema.methods.addLinkToUser = function(linkData) {
  let url = linkData.url;
  if (!!url && !!url.trim()) {
    //Check if url is not blank
    url = url.trim(); //Removes blank spaces from start and end
    if (!/^(https?:)\/\//i.test(url)) {
      //Checks for if url doesn't match either of: http://example.com OR https://example.com
      url = "http://" + url; //Prepend http:// to the URL
    }
    linkData.url = url;
  } else {
    //Handle empty url
  }
  const updatedLinksData = [...this.links];
  updatedLinksData.push({
    title: linkData.title,
    url: linkData.url,
    highlight: linkData.highlight
  });
  this.links = updatedLinksData;
  return this.save();
};

userSchema.methods.removeLinkFromUser = function(linkId) {
  const updatedLinks = this.links.filter(link => {
    return link._id.toString() !== linkId.toString();
  });
  this.links = updatedLinks;
  return this.save();
};

userSchema.methods.toggleHighlight = function(linkId) {
  const linkIndex = this.links.findIndex(link => {
    return link._id.toString() === linkId.toString();
  });
  this.links[linkIndex].highlight = !this.links[linkIndex].highlight;
  return this.save();
};

userSchema.methods.updateLink = function(
  linkId,
  updatedTitle,
  updatedUrl,
  updatedHighlight
) {
  const linkIndex = this.links.findIndex(link => {
    return link._id.toString() === linkId.toString();
  });
  let url = updatedUrl;
  if (!!url && !!url.trim()) {
    //Check if url is not blank
    url = url.trim(); //Removes blank spaces from start and end
    if (!/^(https?:)\/\//i.test(url)) {
      //Checks for if url doesn't match either of: http://example.com OR https://example.com
      url = "http://" + url; //Prepend http:// to the URL
    }
  } else {
    //Handle empty url
  }
  this.links[linkIndex].title = updatedTitle;
  this.links[linkIndex].url = url;
  this.links[linkIndex].highlight = updatedHighlight;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
