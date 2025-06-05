// このファイルは成り、すべての駒の移動、勝敗判定を含む将棋のロジック追加用です
// 以下の構造で関数を定義して、HTML側から呼び出せるようにします

// 駒の種類と移動方向（未プロモート）
const movementRules = {
  '歩': (owner) => [[0, owner === '先手' ? -1 : 1]],
  '金': (owner) => [
    [0, 1], [1, 0], [-1, 0], [0, -1], [1, -1], [-1, -1]
  ].map(([x, y]) => [x, owner === '先手' ? -y : y]),
  '銀': (owner) => [
    [0, 1], [1, 1], [-1, 1], [1, -1], [-1, -1]
  ].map(([x, y]) => [x, owner === '先手' ? -y : y]),
  '桂': (owner) => [[-1, 2], [1, 2]].map(([x, y]) => [x, owner === '先手' ? -y : y]),
  '香': (owner) => {
    const dir = owner === '先手' ? -1 : 1;
    return Array.from({ length: 8 }, (_, i) => [0, dir * (i + 1)]);
  },
  '角': () => {
    const dirs = [];
    for (let d = 1; d < 9; d++) {
      dirs.push([d, d], [-d, d], [d, -d], [-d, -d]);
    }
    return dirs;
  },
  '飛': () => {
    const dirs = [];
    for (let d = 1; d < 9; d++) {
      dirs.push([d, 0], [-d, 0], [0, d], [0, -d]);
    }
    return dirs;
  },
  '王': () => {
    const delta = [-1, 0, 1];
    return delta.flatMap(dx => delta.map(dy => [dx, dy])).filter(([x, y]) => x !== 0 || y !== 0);
  },
};

// 成り駒
const promoteMap = {
  '歩': 'と',
  '香': '成香',
  '桂': '成桂',
  '銀': '成銀',
  '角': '馬',
  '飛': '龍',
};

const demoteMap = Object.fromEntries(Object.entries(promoteMap).map(([k, v]) => [v, k]));

const promotedMovement = {
  'と': movementRules['金'],
  '成香': movementRules['金'],
  '成桂': movementRules['金'],
  '成銀': movementRules['金'],
  '馬': (owner) => [...movementRules['角'](), ...movementRules['王']()],
  '龍': (owner) => [...movementRules['飛'](), ...movementRules['王']()],
};

function isInsideBoard(x, y) {
  return x >= 0 && x < 9 && y >= 0 && y < 9;
}

function getMovableSquares(board, x, y, player) {
  const piece = board[y][x];
  if (!piece || piece.owner !== player) return [];
  const p = piece.piece;
  const rules = promotedMovement[p] || movementRules[p];
  const deltas = typeof rules === 'function' ? rules(player) : rules;
  const moves = [];
  for (const [dx, dy] of deltas) {
    let nx = x + dx, ny = y + dy;
    while (isInsideBoard(nx, ny)) {
      const target = board[ny][nx];
      if (!target) {
        moves.push([nx, ny]);
      } else {
        if (target.owner !== player) moves.push([nx, ny]);
        break;
      }
      if (!["飛", "角", "香", "馬", "龍"].includes(p)) break;
      nx += dx;
      ny += dy;
    }
  }
  return moves;
}

function shouldPromote(piece, fromY, toY, player) {
  const promoteZone = player === '先手' ? [0, 1, 2] : [6, 7, 8];
  return promoteMap[piece] && (promoteZone.includes(fromY) || promoteZone.includes(toY));
}

function checkForWin(board) {
  let kingCount = { '先手': 0, '後手': 0 };
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      const p = board[y][x];
      if (p && (p.piece === '王' || p.piece === '玉')) {
        kingCount[p.owner]++;
      }
    }
  }
  if (kingCount['先手'] === 0) return '後手の勝ち';
  if (kingCount['後手'] === 0) return '先手の勝ち';
  return null;
}

// 必要に応じてHTMLからこれらの関数を呼び出して使用してください。
