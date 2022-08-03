const EMAIL_REQUIRED = "Email is required.";
const USER_EXISTS = "User already exists.";
const PASSWORD_REQUIRED = "Password is required.";
const USER_NOT_FOUND = "User not found.";
const INVALID_PASSWORD = "Invalid password.";
const INACTIVE_ACCOUNT = "Your account is not activated yet, please activate it to log in.";
const TOKEN_REQUIRED = "Token is required.";
const INVALID_TOKEN = "Invalid Token.";
const SUCCESS = "Sucess.";


const TOKEN_EXPIRED = "Token Expired";
const UNAUTHORIZED = "Unauthorized";
const SOMETHING_WRONG = "Something went wrong.";
const DATA_NOT_FOUND = "Data not found.";
const USER_ID_REQUIRED = "User Id is required.";
const CHILD_ID_REQUIRED = "Child Id is required.";
const INVALID_CHILD_ID = "Invalid child ID.";
const CHILD_NOT_FOUND = "Child not found.";
const REQUIRE_CHILD_DEVICE_ID = "Child device Id is required.";
const REQUIRE_FIRESTORE_CHILD_ID = "Firestore child Id is required.";
const PARENT_ID_REQUIRED = "Parent Id is required.";
const TOTAL_PARENT_CONNECTED = "Provide total number of parent connected to the child.";
const CHILD_NOT_CONNECTED = "This child already unlinked with parent.";
const CHILD_NOT_LINKED = "This child is not linked with any device.";

const INVALID_DEVICE_ID = "Invalid device ID.";
const REQUIRE_FIRESTORE_DEVICE_ID = "Firestore device Id is required.";
const DEVICE_NOT_FOUND = "Device not found.";
const DEVICE_NOT_LINKED = "Your device is not linked with parent, please link device.";
const DEVICE_ALREADY_LINKED = "This device already linked with a child. You need to unlink it to link with new child.";
const ACCEPT_REJECT_REQUEST = "Please select if you want to accept or reject this request.";
const REJECTED_UNLINK_REQUEST = "Unlink device request rejected.";
const ACCEPTED_UNLINK_REQUEST = "Unlink device request accepted.";
const APP_UNINSTALLED = "App already uninstalled by the child.";
const APP_NAME_REQUIRED = "App name is required.";

const REQUIRE_TYPE = "Type (install / uninstall) is required.";
const CORRECT_TYPE = "Please enter correct type.";
const REQUIRE_APP_DETAILS = "App details is required.";
const REQUIRE_PACKAGE_NAME = "package name is required.";
const INVALID_PACKAGE_NAME = "Invalid package name.";
const REQUIRE_NOTIFICATION_ID = "Notification ID is required.";
const REQUIRE_FCM = "Fcm token is required.";
const INVALID_FCM = "Invalid fcm token";
const FAQ_TITLE = "Title for FAQ is required.";
const FAQ_MESSAGE = "Message for FAQ is required.";

module.exports = {
  EMAIL_REQUIRED,
  USER_EXISTS,
  PASSWORD_REQUIRED,
  USER_NOT_FOUND,
  INVALID_PASSWORD,
  INACTIVE_ACCOUNT,
  TOKEN_REQUIRED,
  INVALID_TOKEN,
  SUCCESS,

  
  TOKEN_EXPIRED,
  UNAUTHORIZED,
  SOMETHING_WRONG,
  DATA_NOT_FOUND,
  USER_ID_REQUIRED,
  CHILD_ID_REQUIRED,
  INVALID_CHILD_ID,
  CHILD_NOT_FOUND,
  REQUIRE_CHILD_DEVICE_ID,
  REQUIRE_FIRESTORE_CHILD_ID,
  PARENT_ID_REQUIRED,
  TOTAL_PARENT_CONNECTED,
  CHILD_NOT_CONNECTED,
  CHILD_NOT_LINKED,

  INVALID_DEVICE_ID,
  REQUIRE_FIRESTORE_DEVICE_ID,
  DEVICE_NOT_FOUND,
  DEVICE_NOT_LINKED,
  DEVICE_ALREADY_LINKED,
  ACCEPT_REJECT_REQUEST,
  REJECTED_UNLINK_REQUEST,
  ACCEPTED_UNLINK_REQUEST,
  APP_UNINSTALLED,
  APP_NAME_REQUIRED,

  REQUIRE_TYPE,
  CORRECT_TYPE,
  REQUIRE_APP_DETAILS,
  REQUIRE_PACKAGE_NAME,
  INVALID_PACKAGE_NAME,
  REQUIRE_NOTIFICATION_ID,
  REQUIRE_FCM,
  INVALID_FCM,
  FAQ_TITLE,
  FAQ_MESSAGE,
};
