"use client";

function MessageStatus({ status }) {
  switch (status) {
    case "sent":
      return <span className="status-sent">Trimis</span>;
    case "delivered":
      return <span className="status-delivered">Livrat</span>;
    case "seen":
      return <span className="status-seen">Văzut</span>;
    default:
      return null;
  }
}

export default MessageStatus;
