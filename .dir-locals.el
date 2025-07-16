;;; Directory Local Variables         -*- no-byte-compile: t; -*-
;;; For more information see (info "(emacs) Directory Variables")

((typescript-mode
  . ((eval .
           (setq-local
            lsp-clients-typescript-plugins
            (let ((root (project-root (project-current))))
              (when root
                (vector
                 (list :name "@effect/language-service"
                       :location (expand-file-name
                                  "node_modules/@effect/language-service"
                                  root))))))))))
