**Regra do Firebase**



{

&nbsp; "rules": {

&nbsp;   "users": {

&nbsp;     "$id": {

&nbsp;       ".read": "auth != null \&\& (data.child('uid').val() === auth.uid || root.child('administradores').child(auth.uid).exists())",

&nbsp;       ".write": "auth != null \&\& (data.child('uid').val() === auth.uid || root.child('administradores').child(auth.uid).exists())"

&nbsp;     }

&nbsp;   },

&nbsp;   "users\_login": {

&nbsp;     "$id": {

&nbsp;       ".read": "auth != null \&\& (root.child('users').child(auth.uid).child('login\_id').val() === $id || root.child('administradores').child(auth.uid).exists())",

&nbsp;       ".write": "auth != null \&\& root.child('administradores').child(auth.uid).exists()"

&nbsp;     }

&nbsp;   }

&nbsp; }

}









