import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useGesture } from 'react-use-gesture';
import { useSpring, animated, useTransition } from 'react-spring';

const variants = {
  enter: (direction) => {
    const transform = direction > 0 ? 1000 : -1000;
    return {
      transform: `translateX(${transform}px)`,
      opacity: 1,
    };
  },
  center: {
    transform: `translateX(0)`,
    opacity: 1,
  },
  exit: (direction) => {
    const transform = direction > 0 ? -1000 : 1000;
    return {
      transform: `translateX(${transform}px)`,
      opacity: 0,
    };
  },
};

const ImageCarousel = React.memo(({ pictures }) => {
  const [[currentImageIndex, direction], setImageIndex] = useState([0, 0]);
  const [currentImageStyle, setCurrentImageStyle] = useSpring(() => ({
    x: 0,
    y: 0,
  }));

  const paginate = (newDirection) => {
    let nextIndex = currentImageIndex + newDirection;
    if (nextIndex > pictures.length - 1) nextIndex = 0;
    if (nextIndex < 0) nextIndex = pictures.length - 1;
    setImageIndex([nextIndex, newDirection]);
    if (newDirection !== 0) setCurrentImageStyle({ x: 0, y: 0 });
  };

  const transitions = useTransition(currentImageIndex, (i) => i, {
    from: variants.enter(direction),
    enter: variants.center,
    leave: variants.exit(direction),
  });

  const dragProps = useGesture(
    {
      onDrag: ({ delta, movement, velocity, cancel, canceled }) => {
        console.log(movement);
        setCurrentImageStyle({ x: movement[0], y: movement[1] });
        const currentPower = swipePower(movement[0], velocity);
        if (currentPower > swipeConfidenceThreshold) {
          cancel();
          if (canceled) return;
          if (movement[0] > 0) paginate(-1);
          else paginate(1);
        }
      },
      onDragEnd: () => {
        setCurrentImageStyle({ x: 0, y: 0 });
      },
    },
    {
      rubberband: true,
    }
  );

  console.log(currentImageStyle);

  return (
    <div className="image-carousel">
      <div className="picture-container">
        {transitions.map(({ item, props, key }) => {
          const image = pictures[item].src;
          return (
            <animated.div
              key={key}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                overflow: 'hidden',
                ...props,
              }}
            >
              <animated.div
                {...dragProps()}
                style={{
                  height: '100%',
                  width: '100%',
                  cursor: 'pointer',
                  backgroundImage: `url(${image})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  transform: currentImageStyle.x.interpolate(
                    (x) => `translateX(${x}px)`
                  ),
                }}
              ></animated.div>
            </animated.div>
          );
        })}

        <div className="description">
          {pictures[currentImageIndex].description}
        </div>
        <div className="select-right">
          <div className="navigate-container" onClick={() => paginate(1)}>
            <img src={'/icons/navigate-after.svg'} className="navigate" />
          </div>
        </div>
        <div className="select-left">
          <div className="navigate-container" onClick={() => paginate(-1)}>
            <img src={'/icons/navigate-before.svg'} className="navigate" />
          </div>
        </div>
      </div>
      <style jsx>{`
        .image-carousel {
          width: 100%;
          background: rgba(0, 0, 0, 0.9);
          height: 0;
          padding-bottom: 56.25%;
          position: relative;
          border-radius: 8px;
        }

        .picture-container {
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          left: 0;
          overflow: hidden;
        }

        .picture {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
          margin: 0 auto;
        }

        .description {
          position: absolute;
          bottom: 0;
          right: 0;
          left: 0;
          text-align: center;
          opacity: 0.2;
          color: white;
          background: rgba(0, 0, 0, 0.6);
          font-size: 1.2em;
          padding: 1em;
          text-align: center;
          transition: all 0.2s ease-in-out;
          z-index: 2;
          cursor: default;
        }

        .description:hover {
          opacity: 0.8;
        }

        .select-left {
          position: absolute;
          top: 50%;
          bottom: 50%;
          transform: translateY(50%);
          display: flex;
          align-items: center;
          user-select: none;
        }

        .select-right {
          position: absolute;
          top: 50%;
          bottom: 50%;
          right: 0;
          transform: translateY(50%);
          display: flex;
          align-items: center;
          user-select: none;
        }

        .navigate-container {
          margin: auto 1em;
          padding: 0.5em;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }

        .navigate {
          width: 3em;
        }

        .navigate-container:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
});

const swipeConfidenceThreshold = 1000;
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

export default ImageCarousel;
