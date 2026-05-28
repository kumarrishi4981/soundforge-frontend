import React, { useMemo } from 'react';

// Generate a consistent color from username
const getUserColor = (username) => {
  const colors = [
    '#ff2d95', '#00f0ff', '#b44dff', '#39ff14',
    '#ff6b2b', '#f0f', '#ffff00', '#00ff88',
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const UserPresence = ({ users, currentUser }) => {
  const sortedUsers = useMemo(() => {
    if (!users || users.length === 0) return [];
    // Put current user first
    return [...users].sort((a, b) => {
      const aName = typeof a === 'string' ? a : a.username;
      const bName = typeof b === 'string' ? b : b.username;
      if (aName === currentUser) return -1;
      if (bName === currentUser) return 1;
      return 0;
    });
  }, [users, currentUser]);

  return (
    <div className="user-presence">
      <div className="user-count">
        <span className="user-count-number">{sortedUsers.length}</span>
        <span className="user-count-label">online</span>
      </div>

      <div className="user-badges">
        {sortedUsers.map((user, index) => {
          const name = typeof user === 'string' ? user : user.username;
          const isCurrentUser = name === currentUser;
          const color = getUserColor(name);

          return (
            <div
              key={`${name}-${index}`}
              className={`user-badge ${isCurrentUser ? 'current-user' : ''}`}
              title={isCurrentUser ? `${name} (You)` : name}
            >
              <span
                className="user-avatar"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 8px ${color}80`,
                }}
              >
                {name.charAt(0).toUpperCase()}
              </span>
              <span className="user-name">
                {name}
                {isCurrentUser && <span className="you-tag">(you)</span>}
              </span>
              <span
                className="user-pulse"
                style={{ backgroundColor: color }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(UserPresence);
