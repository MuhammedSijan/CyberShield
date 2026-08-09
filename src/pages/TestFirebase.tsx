import { auth, db } from "../firebase/firebase";

export default function TestFirebase() {
    return (
        <div className="p-10">
            <h1>Firebase Connected Successfully ✅</h1>

            <p>Auth:</p>
            <pre>{JSON.stringify(auth.app.options, null, 2)}</pre>

            <p>Firestore:</p>
            <pre>{db.app.name}</pre>
        </div>
    );
}