const battleBackgroundImage = new Image();
battleBackgroundImage.src = 'img/battleBackground.png';
const battleBackground = new Sprite({position: {
  x: 0,
  y: 0
},
image: battleBackgroundImage});

let draggle;
let emby;
let renderSprites;
let queue;
let battleAnimationId;

function initBattle() {
  document.querySelector('#userInterface').style.display = 'block';
  document.querySelector('#dialogueBox').style.display = 'none';
  document.querySelector('#enemyHealthBar').style.width = '100%';
  document.querySelector('#playerHealthBar').style.width = '100%';
  document.querySelector('#attack').replaceChildren();

  draggle = new Monster(monsters.Draggle);
  emby = new Monster(monsters.Emby);
  renderSprites = [draggle, emby];
  queue = [];
  emby.attacks.forEach(attack => {
    const button = document.createElement('button');
    button.innerHTML = attack.name;
    document.querySelector('#attack').append(button);
  });

  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML];
      emby.attack({
        attack: selectedAttack,
        recipient: draggle,
        renderSprites
      });
  
      if(draggle.health <= 0) {
        queue.push(() => {
          draggle.faint();
        });
        queue.push(() => {
          gsap.to('#overlappingDiv', {
            opacity: 1,
            onComplete: () => {
              cancelAnimationFrame(battleAnimationId);
              animate();
              document.querySelector('#userInterface').style.display = 'none';
              gsap.to('#overlappingDiv', {
                opacity: 0
              });

              battle.initiated = false;
              audio.Map.play();
            }
          });
        });
      }
  
      const randomAttack = draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)];
  
      queue.push(() => {
        draggle.attack({
          attack: randomAttack,
          recipient: emby,
          renderSprites
        });
  
        if(emby.health <= 0) {
          queue.push(() => {
            emby.faint();
          });

          queue.push(() => {
            gsap.to('#overlappingDiv', {
              opacity: 1,
              onComplete: () => {
                cancelAnimationFrame(battleAnimationId);
                animate();
                document.querySelector('#userInterface').style.display = 'none';
                gsap.to('#overlappingDiv', {
                  opacity: 0
                });

                battle.initiated = false;
                audio.Map.play();
              }
            });
          });
        }
      });
  
      
  
    });
  
    btn.addEventListener('mouseenter', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML];
      document.querySelector('#attackType').innerHTML = selectedAttack.type;
      document.querySelector('#attackType').style.color = selectedAttack.color;
    });
  });
}

function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle);
  battleBackground.draw();

  renderSprites.forEach(sprite => {
    sprite.draw();
  });
}
animate();
/* initBattle();
animateBattle(); */

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
  if(queue.length > 0) {
    queue[0]();
    queue.shift();
  } else {
    e.currentTarget.style.display = 'none';
  }
});