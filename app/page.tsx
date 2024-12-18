"use client";

import { useSession, signOut } from "next-auth/react";

export default function () {
    const { data, status } = useSession()
    return (
        <>
            {JSON.stringify({ data, status })}
            <button onClick={() => signOut()}>Sign Out</button>
        </>
    )
}
