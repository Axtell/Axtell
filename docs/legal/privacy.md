---
caption: What we collect, why we collect, and how long we collect.
---

### Overview

Note that this **is not** a legal document and the details on this page may have been abridged for brevity. This page outlines what data Axtell collects and what happens to it. Data is distinguished by two types, data you explicitly submit such as posts, comments, and answers, and tracking, data that is sent in the background. If you have any questions or feedback regarding data collection, please leave it on [axtell.fider.io](https://axtell.fider.io).

### Explicit Collection.

This data can always be seen on your profile or in your user settings.

<div class="privacy-column__wrapper">
    <ul class="privacy-column privacy-column--type-positive">
        <li class="privacy-column__nostyle"><h4>We do collect</h4></li>
        <li><strong>email address</strong> for authorization.</li>
        <li><strong>posts</strong> that you submit, i.e. challenges, answers, and comments.</li>
        <li><strong>votes</strong> you perform are associated with your user.</li>
    </ul>
    <ul class="privacy-column privacy-column--type-negative">
        <li class="privacy-column__nostyle"><h4>We never collect</h4></li>
        <li><strong>any personally identifying information</strong></li>
    </ul>
</div>


### Tracking.
<h3 id="tracking">Tracking.</h3>
        <p>Axtell will collect some data in the background. This outlines what data we collect</p>
        <div class="privacy-column__wrapper">
            <ul class="privacy-column privacy-column--type-positive">
                <li class="privacy-column__nostyle"><h4>We do track</h4></li>
                <li><strong>errors</strong> that occur so we can fix them.</li>
                <li><strong>IP</strong> is stored for security and identifying sock-puppets.</li>
                <li><strong>usage data</strong> such as view counts of posts and feature usage.</li>
                <li><strong>speed data</strong>, specifically how much time pages took to load.</li>
                <li><strong>device information</strong>, that is device type (mobile, desktop) and browser (Firefox, Safari, etc.)</li>
            </ul>
            <ul class="privacy-column privacy-column--type-negative">
                <li class="privacy-column__nostyle"><h4>We never track</h4></li>
                <li><strong>your demographics</strong></li>
                <li><strong>intra-site behavior</strong></li>
            </ul>
        </div>

### Usage Tracking.
Axtell tracks your usage of the website by tracking view counts and events. This data is **never** shared with any third-parties and usage tracking is anonymized. Certain events may also be transmitted with error tracking (e.g. if you were writing a comment while the error occured) to provide context for errors.

<div class="privacy-column__wrapper">
    <ul class="privacy-column privacy-column--type-positive">
        <li class="privacy-column__nostyle"><h4>View tracking</h4></li>
        <li><strong>URL</strong> of page visited.</li>
        <li><strong>IP</strong> addresses of anonymous users are temporarially stored in logs.</li>
    </ul>
    <ul class="privacy-column privacy-column--type-positive">
        <li class="privacy-column__nostyle"><h4>Event tracking</h4></li>
        <li><strong>changelog</strong> how many people looked at the changelog?</li>
        <li><strong>comments</strong> how many times did you write a comment?</li>
        <li><strong>answers</strong> how many times did you open the 'Write Answer' dialog?</li>
    </ul>
</div>

### Error Tracking.
Axtell performs error tracking which automatically reports any JavaScript errors which occur when you are on the page. With errors, context is also submitted being the events as described in [Usage Tracking](#usage-tracking). A random 'instance id' is also randomly generated and is associated with all errors reported for a given pgae. This 'instance id' is accessible from the console on the Axtell client and can be used in explicit requests to identify a given report.

### Data Sharing.
**None**. Your data is never shared, never used for advertising, and never sold.

### Push Notifications.
If you subscribe to Axtell push notifications, those notifications go through a third-party service. Push Notifications are sent with the unique notification ID, title, category, and description

If you are subscribed to Push Notifications on macOS Safari, those notifications are encrypted through SSL/TLS, authenticated with a private key from Apple, and signed with an RSA 2048-bit certificate as they are sent to Apple whom will decrypt the notification. The final delivery mechanism is at the discretion of Apple; please refer to [Apple's privacy policy](https://www.apple.com/legal/privacy/) for more information.

If you are subscribed to Web Push notifications, those notifications are end-to-end encrypted. While an intermediate server does exist, your notifications can never be read by it. Axtell encrypts all Web Push notifications with the AES-128 cipher where the key and IV are derived from three pairs of EC keys (based on the [NIST P-256](https://csrc.nist.gov/csrc/media/events/workshop-on-elliptic-curve-cryptography-standards/documents/papers/session6-adalier-mehmet.pdf) curve) which engage in a [Diffie-Hillman key exchange](https://en.wikipedia.org/wiki/Diffie–Hellman_key_exchange) which is used with a [HKDF SHA-256](href="https://en.wikipedia.org/wiki/HKDF) function.

Axtell does gather and store some information when you use notifications
<div class="privacy-column__wrapper">
    <ul class="privacy-column privacy-column--type-positive">
        <li class="privacy-column__nostyle"><h4>macOS Safari</h4></li>
        <li><strong>Device ID</strong> that is random and anonymous.</li>
    </ul>
    <ul class="privacy-column privacy-column--type-positive">
        <li class="privacy-column__nostyle"><h4>Web Push</h4></li>
        <li><strong>Endpoint</strong> that your browser generate, is specific to you, and anonymous</li>
        <li><strong>Public Key and Salt</strong> are randomly geneated by your browser browser which are used to encrypt notifications sent to you.</li>
    </ul>
</div>
