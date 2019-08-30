$("#changeUsernameButton").click(() => {
  if ($("#changeUsernameForm:visible").length) {
    $("#changeUsernameForm").hide();
  } else {
    $("#changeUsernameForm").show();
  }
});

$("#changePasswordButton").click(() => {
  if ($("#changePasswordForm:visible").length) {
    $("#changePasswordForm").hide();
  } else {
    $("#changePasswordForm").show();
  }
});
