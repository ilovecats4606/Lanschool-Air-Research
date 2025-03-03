function connectListeners() {
  document.addEventListener('keydown', function (e) {
    if (e.code === 'KeyW' && e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });
}

document.addEventListener('DOMContentLoaded', connectListeners, false);
