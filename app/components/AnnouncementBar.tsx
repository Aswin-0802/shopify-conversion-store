import {siteContent} from '~/lib/site-content';

export function AnnouncementBar() {
  const message = `${siteContent.announcement}   ·   ${siteContent.announcement}`;

  return (
    <div className="announcement-bar" role="region" aria-label="Announcement">
      <div className="announcement-track">
        <p>{message}</p>
        <p aria-hidden="true">{message}</p>
      </div>
    </div>
  );
}
