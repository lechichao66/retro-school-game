(function initPlayerStateBridge(global) {
  const g = global || window;

  function getPlayerSafe() {
    return g.player || null;
  }

  function setPlayerSafe(nextPlayer) {
    if (!nextPlayer || typeof nextPlayer !== "object") return;
    g.player = nextPlayer;
  }

  g.__JH_PLAYER_STATE__ = {
    getPlayerSafe,
    setPlayerSafe
  };
})(window);
