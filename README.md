<div align="center">
    <p>Akamai Uploader tool</p>
</div>

<div>
    <p><b>To install in a project:</b><code>npm install --savedev akamai-uploader</code></p>
    <p>
        <b>Command line:</b>
        <code>akamai -c <command> -r <account-root> -p <path> -u <upload-path></code>
    </p>
    <ul>command:
        <li>read - read the contents from account-root and path combination</li>
        <li>clean - specified by path from account-root and path</li>
        <li>upload - upload a directory specified by upload-path</li>
    </ul>
    <p>You will need to supply the following as enivronment variables</p>
    <ul>
        <li>AKAMAI_KEY_NAME - Your AKAMAI key NAME</li>
        <li>AKAMAI_KEY - This will be that weird UUID value</li>
        <li>AKAMAI_HOST - the server with the domain name for your Akamai server.</li>
    </ul>
    <p>The environment variable may also be included as command line parameters as:</p>
    <ul>
        <li> -n or --akamaiKeyName </li>
        <li> -k or --akamaiKey </li>
        <li> -h or --akamaiHost </li>
    </ul>
    <p>Examples (it assumes you have configured the environment variables):</p>
    <ul>
        <li>To clear a folder: akamai -c clean -r /your_root_account -p /directory_to_clear</li>
        <li>To upload a folder: akamai -r /your_root_account -p / -c upload -u /your_local_folder</li>
        <li>To read a folder: akama -c read -r /your_root_account -p /directory_to_read</li>
    </ul>
</div>