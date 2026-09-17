-- Publish owner-confirmed BR Tours and Travels contact and social details.
INSERT INTO `Setting` (
    `key`,
    `value`,
    `isPublic`,
    `description`,
    `updatedAt`
)
VALUES
    (
        'contact.phone',
        JSON_QUOTE('+91 79907 21001'),
        true,
        'Public BR Tours and Travels contact number.',
        CURRENT_TIMESTAMP(3)
    ),
    (
        'contact.whatsapp',
        JSON_QUOTE('+91 79907 21001'),
        true,
        'Public BR Tours and Travels WhatsApp number.',
        CURRENT_TIMESTAMP(3)
    ),
    (
        'contact.address',
        JSON_QUOTE('10, Natha Lal Park Society, Shree Kadi Nagrik Shakari Bank, Shak Market Road, Balol Nagar'),
        true,
        'Public BR Tours and Travels office address.',
        CURRENT_TIMESTAMP(3)
    ),
    (
        'social.instagram',
        JSON_QUOTE('https://www.instagram.com/br_tours_travels?stkn=ZnFsZ2E0dGlnajZs&utm_source=qr'),
        true,
        'Official BR Tours and Travels Instagram profile.',
        CURRENT_TIMESTAMP(3)
    ),
    (
        'social.facebook',
        JSON_QUOTE('https://www.facebook.com/share/1EdDpd2pfZ/?mibextid=wwXIfr'),
        true,
        'Official BR Tours and Travels Facebook page.',
        CURRENT_TIMESTAMP(3)
    )
ON DUPLICATE KEY UPDATE
    `value` = VALUES(`value`),
    `isPublic` = VALUES(`isPublic`),
    `description` = VALUES(`description`),
    `updatedAt` = VALUES(`updatedAt`);
