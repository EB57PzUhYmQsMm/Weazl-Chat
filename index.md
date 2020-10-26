## Weazl Chat
The server & site for Weazl Chat.
# How to connect
Simply type localhost in your browser to test your code out or if you want to connect to multiple sockets just edit script.js and choose the socket url
# Contributing
Look for new issues or improvements in the code (A lot are available right now)
# Dependencies
Uses Express for sending webpages (Anything under htdocs) and uses SOCKET.IO for networking & communication

# Features
- Link support (adding auto tags and href + opens in a new tab because of target=_blank)
- Message Limits (Character Limits)
- Message Cleanup (deletes divs that user probably doesnt need to save memory)
- Basic Name Changing (through console atm) and Name Choosing features
- Basic Error and System Message logging
- Basic Name Filter
- Basic Space Filter (Invisible Names / Messages)
- Youtube Video Embedding
- MP4 Video Link Embedding
- Client Download Link Overlays Settings Emojis Blacklisting Auto Update IP Logging/Blacklisting & More

# Notes
If you do want to use the Download Client feature, and want to make your own electron client before we release ours, Please make sure to have a Application.zip under your htdocs directory I added DOMPurify because I noticed an XSS glitch. Since I needed to add link and image html elements, I change the jQuery.text() to .html(), oh boy did this not cause 5 million issues. I have now fixed that and added DOMPurify in for everyone to use
