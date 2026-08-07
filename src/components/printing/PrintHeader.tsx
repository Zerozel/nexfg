"use client";

import Image from "next/image";

interface PrintHeaderProps {
  schoolName: string;
  logoUrl?: string | null;
  motto?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  primaryColor?: string;
}

export function PrintHeader({
  schoolName,
  logoUrl,
  motto,
  address,
  phone,
  email,
  primaryColor = "#2563eb",
}: PrintHeaderProps) {
  return (
    <div
      className="school-header"
      style={{ "--primary-color": primaryColor } as React.CSSProperties}
    >
      {logoUrl && (
        <div className="logo-container">
          <Image
            src={logoUrl}
            alt={`${schoolName} logo`}
            width={200}
            height={60}
            className="logo"
            unoptimized
          />
        </div>
      )}

      <h1 className="school-name" style={{ color: primaryColor }}>
        {schoolName}
      </h1>

      {motto && <p className="school-motto">{motto}</p>}

      {(address || phone || email) && (
        <p className="school-contact">
          {address && <span>{address}</span>}
          {address && (phone || email) && <span>|</span>}
          {phone && <span>Tel: {phone}</span>}
          {phone && email && <span>|</span>}
          {email && <span>Email: {email}</span>}
        </p>
      )}
    </div>
  );
}
