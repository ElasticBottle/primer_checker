#! /afs//bii.a-star.edu.sg/dept/mendel/METHODS/corona/local/anaconda3/bin/python3.7

import cgi

# use to provide tracebacks within the cgi if something goes wrong
import cgitb

# Prints any error to t windows from which the script was executed from
cgitb.enable()

# Logs the output to a file and does not show the error on the webpage itself
# cgitb.enable(display = 0, logdir ="path/to/logdir")


# Printing a minimal header
# To be set before printing any results of the HTML body
print("Content-Type: text/html")  # HTML is following
print()  # blank line, end of headers


# Printing a minimal HTML example
print("<TITLE>CGI script output</TITLE>")
print("<H1>This is my first CGI script</H1>")
print("Hello, world!")

# Retrieves any parameters passed to the server either through GET or POST
arguments = cgi.FieldStorage(encoding="utf-8", keep_blank_values=False)

# argument is of class FieldStorage which behaves like a dictionary in Python
# - It has len(), .keys(), `in` methods available.
# - Objects from FieldStorage are of themselves, FieldStorage objects.
# - Use the `.value` property or `.getvalue()` method to retrieve the underlying value of the input (normally either string or contents of a file)
# - If there is multiple objects with the same key, then the result is a list of FieldStorage objects.
result = arguments.getvalue("test_key", 0)

# Alternatively, use `getlist()` to ensure that you always get a list, even for a single item.
# Empty list will be returned if the key doesn't exist in the parent `FieldStorage()` object
result_list = arguments.getlist("test_key")

# If you rather not read the whole file at once, use the key associated with the file to the teh `FieldStorage` object for it
# File identity can then be tested with the `.file` or `.filename` property
fileitem = arguments.getlist("userfile")
if len(fileitem) != 0:
    file = fileitem[0].file
    if file:
        # Do something with the
        pass
    else:
        # Not a file
        pass

print(arguments)

